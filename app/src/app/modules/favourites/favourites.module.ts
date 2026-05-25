import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Favourite, FavouriteSchema } from './favourite.entity';
import { ReportsModule } from '../reports/reports.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Favourite.name, schema: FavouriteSchema }]),
    UsersModule,
    ReportsModule
  ],
  controllers: [FavouritesController],
  providers: [FavouritesService],
  exports: [FavouritesService]
})
export class FavouritesModule { }
