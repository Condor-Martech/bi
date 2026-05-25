import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, versionKey: false })

export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  userID: string;

  @Prop({ default: false })
  readme: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índice composto para a consulta paginada por usuário (findAllForUser).
NotificationSchema.index({ userID: 1, createdAt: -1 });

