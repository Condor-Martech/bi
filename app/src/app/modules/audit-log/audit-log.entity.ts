import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

/**
 * Audit log — registro inmutable de acciones administrativas.
 *
 * Replica el patrón de packages/db/src/schema/audit-log.ts del new-bi:
 * - Snapshot del actor (email, role) — sobrevive cambios futuros en User.
 * - before/after del recurso — permite reconstruir el cambio.
 * - Retention larga (no expira por defecto) — borrar es decisión del admin.
 */
@Schema({ timestamps: true, versionKey: false })
export class AuditLog {
  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  resourceType: string;

  @Prop({ index: true })
  resourceId: string;

  // Actor snapshot
  @Prop({ required: true, index: true })
  actorUserId: string;

  @Prop()
  actorEmailSnapshot: string;

  @Prop()
  actorRoleSnapshot: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  // Resource snapshots
  @Prop({ type: Object })
  before: Record<string, unknown>;

  @Prop({ type: Object })
  after: Record<string, unknown>;

  @Prop({ type: Object })
  metadata: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Filtro común: timeline por actor.
AuditLogSchema.index({ actorUserId: 1, createdAt: -1 });
// Filtro común: histórico de un recurso específico.
AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
// Filtro común: todas las acciones de un tipo en una ventana.
AuditLogSchema.index({ action: 1, createdAt: -1 });
