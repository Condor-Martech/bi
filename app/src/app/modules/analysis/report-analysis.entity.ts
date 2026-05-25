import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportAnalysisDocument = ReportAnalysis & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ReportAnalysis {
  /** reportIdPB do relatório analisado. */
  @Prop({ index: true })
  reportId: string;

  @Prop()
  reportName: string;

  @Prop()
  datasetId: string;

  @Prop()
  groupId: string;

  @Prop()
  userId: string;

  @Prop()
  userEmail: string;

  @Prop({ default: 'pt-BR' })
  language: string;

  @Prop()
  focus: string;

  @Prop()
  summary: string;

  @Prop({ type: [String], default: [] })
  keyFindings: string[];

  @Prop({ type: [String], default: [] })
  anomalies: string[];

  @Prop({ type: [String], default: [] })
  recommendations: string[];

  /** Trazabilidade das queries DAX executadas: { purpose, query, rowCount, truncated?, sampleRows?, error? } */
  @Prop({ type: [Object], default: [] })
  daxRuns: any[];

  @Prop()
  model: string;

  @Prop({ default: 0 })
  promptTokens: number;

  @Prop({ default: 0 })
  completionTokens: number;

  @Prop({ default: 0 })
  totalTokens: number;

  @Prop({ default: 0 })
  estimatedCostUsd: number;

  @Prop({ default: 0 })
  iterations: number;

  /** 'success' | 'partial' | 'failed' */
  @Prop({ default: 'success' })
  status: string;

  @Prop()
  errorMessage: string;
}

export const ReportAnalysisSchema = SchemaFactory.createForClass(ReportAnalysis);
