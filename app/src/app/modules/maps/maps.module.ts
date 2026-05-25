import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Map, MapSchema } from './map.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }])],
  controllers: [MapsController],
  providers: [MapsService]
})
export class MapsModule { }
