import { Module } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGroupSchema, UserGroups } from './user-group.entity';
import { User, UserSchema } from '../users/user.entity';
import { Report, ReportSchema } from '../reports/report.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: UserGroups.name, schema: UserGroupSchema }]),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }])
  ],
  controllers: [UserGroupsController],
  providers: [UserGroupsService],
  exports: [UserGroupsService]
})
export class UserGroupsModule { }
