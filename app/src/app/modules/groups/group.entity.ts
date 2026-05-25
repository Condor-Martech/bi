import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Report } from "../reports/report.entity";


export type GroupsDocument = Group & Document;
@Schema({
    timestamps: true,
    versionKey: false
})
export class Group {
    @Prop()
    groupIdPB: string;

    @Prop()
    accountId: string

    @Prop()
    name: string;

    @Prop()
    isReadOnly: boolean;

    @Prop()
    isOnDedicatedCapacity: boolean;

    @Prop()
    type: string;

    @Prop()
    reports?: string[]

    constructor(group?: Partial<Group>) {
        this.groupIdPB = group?.groupIdPB;
        this.name = group?.name;
        this.isReadOnly = group?.isReadOnly;
        this.isOnDedicatedCapacity = group?.isOnDedicatedCapacity;
        this.type = group?.type;
        this.reports = group?.reports;
    }
}

export const GroupSchema = SchemaFactory.createForClass(Group);


GroupSchema.virtual('report', {
    ref: 'Report',
    localField: 'reports',
    foreignField: 'reportIdPB',
    justOne: false,
});

GroupSchema.set('toObject', { virtuals: true });
GroupSchema.set('toJSON', { virtuals: true });

