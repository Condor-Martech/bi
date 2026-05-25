import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MapDocument = Map & Document;
@Schema({
    timestamps: true,
    versionKey: false
})
export class Map {
    @Prop()
    name: string;

    @Prop()
    webUrl: string;

    constructor(map?: Partial<Map>) {
        this.name = map?.name;
        this.webUrl = map?.webUrl;
    }
};
export const MapSchema = SchemaFactory.createForClass(Map);