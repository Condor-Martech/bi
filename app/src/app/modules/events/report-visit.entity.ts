import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportVisitDocument = ReportVisit & Document;

/**
 * Contador agregado por par (userId, reportIdPB). Una fila por combinación.
 *
 * Diseño:
 * - `visitCount` se incrementa atómicamente vía $inc en upsert.
 * - `lastVisitedAt` / `firstVisitedAt` permiten responder "último acceso" y
 *   "cohort de primera vista" sin agregar sobre `user_events`.
 * - NO expira (es agregado). Si un user se borra, limpieza por cron aparte.
 *
 * Replica el patrón de packages/db/src/schema/report-visits.ts del new-bi
 * para que la migración futura sea casi copy-paste.
 */
@Schema({ timestamps: true, versionKey: false })
export class ReportVisit {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  reportIdPB: string;

  /** 'report' | 'custom_report' — para distinguir en queries top. */
  @Prop({ required: true, index: true })
  resourceType: string;

  @Prop({ default: 0 })
  visitCount: number;

  @Prop()
  firstVisitedAt: Date;

  @Prop({ index: true })
  lastVisitedAt: Date;
}

export const ReportVisitSchema = SchemaFactory.createForClass(ReportVisit);

// Único por (userId, reportIdPB, resourceType) — base del upsert.
ReportVisitSchema.index(
  { userId: 1, reportIdPB: 1, resourceType: 1 },
  { unique: true },
);

// Para "top reports" globales por ventana temporal.
ReportVisitSchema.index({ resourceType: 1, lastVisitedAt: -1 });
