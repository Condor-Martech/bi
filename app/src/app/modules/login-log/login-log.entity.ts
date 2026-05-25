import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


export type LoginDocument = LoginLog & Document
@Schema()
export class LoginLog {

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }] })
    userId: string[];

    @Prop()
    loginTime: string;
}



export const LoginSchema = SchemaFactory.createForClass(LoginLog);




