import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({
    timestamps: true,
    versionKey: false
})
export class Account {
    @Prop()
    nameAccount: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    pass: string;

    @Prop({ required: true })
    clientId: string;

    @Prop({ required: true })
    clientSecret: string;

    @Prop()
    tenantId: string;

    @Prop()
    token: string;

    @Prop()
    refreshToken: string;

    @Prop()
    expiresIn: string;

    @Prop()
    expiresOn: string;

    @Prop()
    userCount: number;

    @Prop()
    users: string[]

}
export const AccountSchema = SchemaFactory.createForClass(Account);