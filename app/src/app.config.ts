import { CacheModuleAsyncOptions, Provider } from "@nestjs/common";
import { redisStore } from "cache-manager-redis-yet";
import { ConfigService } from '@nestjs/config';
import { MailerOptions } from "@nestjs-modules/mailer";
import { BullRootModuleOptions, SharedBullAsyncConfiguration } from "@nestjs/bull";
import { join } from "path";
import { ServeStaticModuleOptions } from "@nestjs/serve-static";
import { APP_GUARD } from "@nestjs/core";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./app/core/auth/auth.guard";
import { RolesGuard } from "./app/core/auth/roles.guard";
import { BackupService } from "./app/core/services/backup.service";
import { TasksService } from "./app/core/services/tasks.services";
import { EncryptionService } from "./app/core/utils/encryption.service";
import { ConnectOptions } from "mongoose";
import { MongooseModuleAsyncOptions } from "@nestjs/mongoose";

const REQUIRED_ENV_VARS = [
  'MONGO_DSN',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'POWER_BI_BASE_URL',
  'AZURE_URL',
  'AZURE_CLIENT_SECRET',
  'REDIS_HOST',
  'REDIS_PORT',
  // SMTP — sem isso o welcome / reset / notification emails falham silenciosamente.
  'MAIL_SMTP',
  'MAIL_PORT',
  'APP_MAIL_USER',
  'APP_MAIL_PASS',
  // BASE_URL é usado para construir o link de set-password do welcome email.
  'BASE_URL',
  // Basic-auth obrigatório no Bull Board (/admin/queues).
  'BULL_BOARD_USER',
  'BULL_BOARD_PASS',
];

function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_ENV_VARS.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }
  return config;
}

export const CONF = { isGlobal: true, validate: validateEnv };

export const STATIC_CONF: ServeStaticModuleOptions = {
  rootPath: join(__dirname, '..', 'public'),
};

export const CACHE_CONF: CacheModuleAsyncOptions = {
  isGlobal: true,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.get('REDIS_HOST'),
        port: +configService.get('REDIS_PORT'),
      },
    });
    return {
      store,
      // TTL em milissegundos — cache-manager v5 trabalha em ms (v3/v4 usavam segundos).
      ttl: 1000 * 60 * 60 * 24 * 7,
    };
  },
};

export const MAILER_CONF = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): MailerOptions => {
    // Workaround Condor SMTP: el server solo habla TLS 1.0 con cipher legacy
    // (DHE-RSA-AES256-SHA). Node 24 + OpenSSL 3 bloquea eso por default. Para
    // destrabar usamos minVersion=TLSv1 y ciphers='DEFAULT@SECLEVEL=0' (override
    // del security level que OpenSSL 3 aplica antes de set_min_proto_version).
    // ⚠️ Cuando IT actualice el Postfix a TLS 1.2+, REVERTIR a TLSv1.2 sin ciphers.
    const minVersion = (configService.get<string>('MAIL_MIN_TLS') ?? 'TLSv1.2') as
      | 'TLSv1'
      | 'TLSv1.1'
      | 'TLSv1.2'
      | 'TLSv1.3';
    const ciphers = configService.get<string>('MAIL_CIPHERS');
    return {
      transport: {
        host: configService.get<string>('MAIL_SMTP'),
        port: Number(configService.get('MAIL_PORT')),
        ignoreTLS: false,
        secure: false,
        auth: {
          user: configService.get<string>('APP_MAIL_USER'),
          pass: configService.get<string>('APP_MAIL_PASS'),
        },
        tls: {
          minVersion,
          rejectUnauthorized: false,
          ...(ciphers ? { ciphers } : {}),
        },
      },
    };
  },
};

export const REDIS_CONF: SharedBullAsyncConfiguration = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): BullRootModuleOptions => ({
    redis: {
      host: configService.get<string>('REDIS_HOST'),
      port: +configService.get('REDIS_PORT'),
    },
  }),
};

export const MONGO_CONF: ConnectOptions | any = {
  autoIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectionFactory: (connection: any) => {
    connection.plugin(require('mongoose-autopopulate'));
    return connection
  },
};

export const MONGO_ASYNC_CONF: MongooseModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_DSN'),
    ...MONGO_CONF,
  }),
};

export const PROVIDER: Provider[] = [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  AppService, TasksService, EncryptionService, BackupService
]