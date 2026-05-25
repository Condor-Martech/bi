import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMapDto } from './create-map.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Map, MapDocument } from './map.entity';
import { Model } from 'mongoose';

@Injectable()
export class MapsService {
  constructor(
    @InjectModel(Map.name) private readonly mapModel: Model<MapDocument>
  ) { }
  async create(createMapDto: CreateMapDto) {
    try {
      const map = new this.mapModel(createMapDto);
      await map.save();
      return map;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async findAll() {
    const result = await this.mapModel.find();
    return result;

  };
  async findOne(id: string) {
    const result = await this.mapModel.findById(id);
    return result;
  }

}
