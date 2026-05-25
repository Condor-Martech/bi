import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";


export type FilterDocument = Filter & Document;
@Schema({
    timestamps: true,
    versionKey: false
})
export class Filter {
    @Prop()
    table: string;

    @Prop()
    column: string;

    @Prop()
    value: string[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'filters' }] })
    userId: string;

    constructor(filter?: Partial<Filter>) {
        this.table = filter.table;
        this.column = filter.column;
        this.value = filter.value;
        this.userId = filter.userId;
    };
}
export const FilterSchema = SchemaFactory.createForClass(Filter);
