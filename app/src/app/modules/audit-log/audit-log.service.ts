import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AUDIT_EVENT,
  AuditAction,
  AuditActor,
  AuditEventPayload,
  AuditResourceType,
} from './audit-log.constants';
import { AuditLog, AuditLogDocument } from './audit-log.entity';

/**
 * Servicio de audit log.
 *
 * Roles:
 * 1. `emit*` — fachada para que los services del dominio publiquen acciones.
 * 2. `record` — usado por el listener para persistir. NO llamar directo desde dominio.
 *
 * Patrón fire-and-forget: si la persistencia falla, NO afecta la request.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly model: Model<AuditLogDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Emisión ─────────────────────────────────────────────────────────────

  emit(payload: AuditEventPayload): void {
    try {
      this.eventEmitter.emit(AUDIT_EVENT, payload);
    } catch (err) {
      this.logger.warn(`Failed to emit audit "${payload.action}": ${(err as Error).message}`);
    }
  }

  emitChange(input: {
    action: AuditAction;
    resourceType: AuditResourceType;
    resourceId: string | null;
    actor: AuditActor;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
  }): void {
    this.emit(input);
  }

  // ─── Persistencia ────────────────────────────────────────────────────────

  async record(payload: AuditEventPayload): Promise<void> {
    const doc = new this.model({
      action: payload.action,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId || undefined,
      actorUserId: payload.actor.userId,
      actorEmailSnapshot: payload.actor.email || undefined,
      actorRoleSnapshot: payload.actor.role || undefined,
      ipAddress: payload.actor.ipAddress || undefined,
      userAgent: payload.actor.userAgent || undefined,
      before: payload.before || undefined,
      after: payload.after || undefined,
      metadata: payload.metadata || undefined,
    });
    await doc.save();
  }
}
