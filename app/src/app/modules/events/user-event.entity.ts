import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserEventDocument = UserEvent & Document;

/**
 * Log raw de eventos del usuario. Una fila por evento.
 *
 * Retention: 90 días (cron de limpieza — pendiente). Para queries agregadas
 * de "top reportes" usar `report_visits` (counter), no aggregations sobre
 * esta colección.
 */
@Schema({ timestamps: true, versionKey: false })
export class UserEvent {
  @Prop({ required: true, index: true })
  eventName: string;

  @Prop({ index: true })
  userId: string;

  /** Snapshot al momento del evento — sobrevive cambios en User. */
  @Prop()
  userEmail: string;

  @Prop()
  userRole: string;

  @Prop({ index: true })
  resourceType: string;

  @Prop({ index: true })
  resourceId: string;

  @Prop({ type: Object })
  metadata: Record<string, unknown>;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const UserEventSchema = SchemaFactory.createForClass(UserEvent);

// Índices compuestos para queries típicas:
// - Timeline por usuario
UserEventSchema.index({ userId: 1, createdAt: -1 });
// - Reportes top por ventana temporal (cuando NO usamos report_visits)
UserEventSchema.index({ eventName: 1, createdAt: -1 });
// - Lookup por recurso (quién accedió este reporte / quién leyó esta notif)
UserEventSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
