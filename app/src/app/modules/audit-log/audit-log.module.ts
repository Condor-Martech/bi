import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuditLog, AuditLogSchema } from './audit-log.entity';
import { AuditLogListener } from './audit-log.listener';
import { AuditLogService } from './audit-log.service';

/**
 * Audit log — Tier 3 admin actions.
 *
 * `@Global()` para que cualquier service del dominio pueda inyectar
 * AuditLogService sin cadenas de imports.
 *
 * En v1 (Tier 1+2) no hay emisión todavía — solo infraestructura para PR 4.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  providers: [AuditLogService, AuditLogListener],
  exports: [AuditLogService],
})
export class AuditLogModule {}
