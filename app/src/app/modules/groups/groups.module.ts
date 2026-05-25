import { HttpModule } from '@nestjs/axios';
import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Report, ReportSchema } from '../reports/report.entity';
import { ReportsModule } from '../reports/reports.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    forwardRef(() => ReportsModule),
    HttpModule

  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService]
})
export class GroupModule { }
