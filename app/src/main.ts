import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from "@sentry/node";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // CORS — gated por env var CORS_ALLOWED_ORIGINS (CSV).
  // Si está vacía o seteada a "*" → comportamiento legacy (origin abierto).
  // Si lista concreta → allowlist estricta. Mantener BFF de legacy/web-next en localhost:3002.
  const rawOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "").trim();
  const isAllowAll = rawOrigins === "" || rawOrigins === "*";
  const allowedOrigins = isAllowAll
    ? "*"
    : rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ["Authorization", "Content-Type", "Accept", "Cache-Control"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["Content-Disposition"],
    credentials: !isAllowAll, // credentials no se pueden combinar con origin:"*"
    maxAge: 600,
  });
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });

  const config = new DocumentBuilder()
    .setTitle('Power BI Interface API')
    .setDescription(
      [
        'Gateway multi-tenant para o Microsoft Power BI.',
        '',
        'Autentica contra o Azure AD por tenant, sincroniza workspaces e relatórios,',
        'e os serve aos usuários finais com RBAC, filtros row-level, grupos de usuários,',
        'favoritos, relatórios customizados e notificações.',
        '',
        '## Autenticação',
        'A maioria dos endpoints exige um token JWT. Faça login em `POST /users/login`,',
        'copie o `access_token` da resposta e informe-o no botão **Authorize** (esquema Bearer).',
        'O token é persistido entre recarregamentos desta página.',
        '',
        '## Papéis (RBAC)',
        '- `manager` — acesso total, incluindo sincronização do Power BI e gestão de contas.',
        '- `admin` — gestão de usuários e conteúdo.',
        '- `user` — consumo de relatórios e favoritos.',
      ].join('\n'),
    )
    .setVersion('1.1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Informe o access_token retornado por POST /users/login.',
    })
    .addServer('http://localhost:3000', 'Local')
    .addTag('Accounts', 'Credenciais de tenants Azure AD / Power BI')
    .addTag('Groups', 'Workspaces (groups) do Power BI')
    .addTag('Reports', 'Relatórios do Power BI e sincronização')
    .addTag('Users', 'Gestão de usuários e autenticação')
    .addTag('User-Groups', 'Agrupamento de usuários para permissões')
    .addTag('Custom-Reports', 'Relatórios customizados')
    .addTag('Favourites', 'Relatórios favoritos por usuário')
    .addTag('Filters', 'Filtros row-level aplicados aos relatórios')
    .addTag('Maps', 'Upload de arquivos / mapas')
    .addTag('Notifications', 'Notificações para usuários')
    .addTag('Login-Log', 'Registro de acessos / auditoria de login')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Power BI Interface API — Docs',
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(3000);
}
bootstrap();
