import { Module } from '@nestjs/common';
import { CustomReportsService } from './custom-reports.service';
import { CustomReportsController } from './custom-reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomReport, CustomSchema } from './custom-report.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: CustomReport.name, schema: CustomSchema }]),
    UsersModule
  ],
  controllers: [CustomReportsController],
  providers: [CustomReportsService],
  exports: [CustomReportsService]
})

export class CustomReportsModule { }
