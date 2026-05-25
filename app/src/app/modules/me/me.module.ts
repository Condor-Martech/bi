import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PermissionsModule } from '../../core/permissions/permissions.module';
import { Account, AccountSchema } from '../accounts/account.entity';
import { Group, GroupSchema } from '../groups/group.entity';
import { Report, ReportSchema } from '../reports/report.entity';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    PermissionsModule,
  ],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
