import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import { Document } from 'mongoose';

export type CustomReportDocument = CustomReport & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class CustomReport {
  @Prop({ default: () => randomUUID() })
  reportIdPB: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Object })
  author: object;
}

export const CustomSchema = SchemaFactory.createForClass(CustomReport);
