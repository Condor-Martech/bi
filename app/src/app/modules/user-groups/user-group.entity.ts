import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



export type UserGroupDocument = UserGroups & Document;
@Schema({
  timestamps: true,
  versionKey: false
})
export class UserGroups {

  @Prop()
  name: string;

  @Prop()
  accountID: string;

  @Prop()
  users: string[];

  @Prop()
  reports: string[];


  constructor(userGroup?: Partial<UserGroups>) {
    this.name = userGroup?.name;
    this.users = userGroup?.users;
    this.reports = userGroup?.reports;

  }
}
export const UserGroupSchema = SchemaFactory.createForClass(UserGroups);

