import { Module, forwardRef } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './report.entity';
import { Group, GroupSchema } from '../groups/group.entity';
import { HttpModule } from '@nestjs/axios';
import { ReportsService } from './reports.service';
import { Account, AccountSchema } from '../accounts/account.entity';
import { PermissionsModule } from '../../core/permissions/permissions.module';
import { JobModule } from '../../core/jobs/jobs.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    HttpModule,
    PermissionsModule,
    // ReportsController inyecta `ReportSyncProducer` para encolar syncs.
    // forwardRef porque JobModule importa ReportsModule (necesita ReportsService
    // para el consumer del sync).
    forwardRef(() => JobModule),

  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule { }
