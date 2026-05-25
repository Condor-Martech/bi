import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type UserDocument = User & Document;
@Schema({
    timestamps: true,
    versionKey: false
})
export class User {
    @Prop()
    name: string;

    @Prop()
    password: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    role: string;

    @Prop()
    userIslv: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'accounts' }], index: true })
    accountID?: string[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'accounts' }] })
    filterId?: string[];

    @Prop()
    groupByPB?: string[];

    @Prop()
    reportsByPB?: string[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserGroups' })
    userGroups?: string;


    constructor(user?: Partial<User>) {
        this.name = user?.name;
        this.password = user?.password;
        this.email = user?.email;
        this.role = user?.role;
        this.accountID = user?.accountID;
        this.groupByPB = user?.groupByPB;
        this.reportsByPB = user?.reportsByPB;
    }

}
export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserSchema.virtual('group', {
    ref: 'Group',
    localField: 'groupByPB',
    foreignField: 'groupIdPB',
    justOne: false,
});

UserSchema.virtual('report', {
    ref: 'Report',
    localField: 'reportsByPB',
    foreignField: 'reportIdPB',
    justOne: false,
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
