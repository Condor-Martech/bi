import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AUDIT_EVENT, AuditEventPayload } from './audit-log.constants';
import { AuditLogService } from './audit-log.service';

/**
 * Consumidor async del evento AUDIT_EVENT. Fire-and-forget.
 *
 * Equivalente al patrón new-bi audit-log.listener.ts.
 */
@Injectable()
export class AuditLogListener {
  private readonly logger = new Logger(AuditLogListener.name);

  constructor(private readonly service: AuditLogService) {}

  @OnEvent(AUDIT_EVENT, { async: true })
  async onAudit(payload: AuditEventPayload): Promise<void> {
    try {
      await this.service.record(payload);
    } catch (err) {
      this.logger.error(
        `Failed to persist audit_log "${payload.action}" ${payload.resourceType}:${payload.resourceId ?? '-'}: ${(err as Error).message}`,
      );
    }
  }
}
