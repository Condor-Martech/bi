import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Filter, FilterSchema } from './entities/filter.entity';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Filter.name, schema: FilterSchema }]),
    UsersModule,
    HttpModule
  ],
  controllers: [FiltersController],
  providers: [FiltersService]
})
export class FiltersModule { }
