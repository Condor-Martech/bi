import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCustomReportDto } from './dto/create-custom-report.dto';
import { UpdateCustomReportDto } from './dto/update-custom-report.dto';
import { Model, Error as MongooseError } from 'mongoose';
import { CustomReport } from './custom-report.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CustomReportsService {
  constructor(
    @InjectModel(CustomReport.name) private customReportModel: Model<CustomReport>,
    private readonly userService: UsersService,

  ) { }

  async create(createCustomReportDto: CreateCustomReportDto) {
    try {
      const user = await this.userService.findOneByUserID(createCustomReportDto.author);
      if (!user) {
        throw new NotFoundException(`User com ID ${createCustomReportDto.author} não encontrado`);
      }
      const author = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      const reportData = {
        reportIdPB: randomUUID(),
        name: createCustomReportDto.name,
        url: createCustomReportDto.url,
        author: author
      };

      const createdReport = await this.customReportModel.create(reportData);
      return createdReport
    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`User not found: ${error.message}`);
      }
      throw new InternalServerErrorException(error.message);
    }
  };

  async findAll() {
    try {
      return await this.customReportModel.find().exec();

    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(reportIdPB: string) {
    try {
      const report = await this.customReportModel.findOne({ reportIdPB });
      if (!report) {
        throw new NotFoundException(`Report with ID ${reportIdPB} not found`);
      }
      return report;

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`Report with ID ${reportIdPB} not found: ${error.message}`);
      }
      throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
    }
  }

  async update(reportIdPB: string, updateCustomReportDto: UpdateCustomReportDto) {
    try {
      const report: any = await this.customReportModel.findOne({ reportIdPB });
      if (!report) {
        throw new NotFoundException(`Report with ID ${reportIdPB} not found`);
      }

      let updatedFields: any = { ...updateCustomReportDto };

      if (updateCustomReportDto.author && updateCustomReportDto.author !== report.author.id) {
        const user = await this.userService.findOne(updateCustomReportDto.author);
        if (!user) {
          throw new NotFoundException(`User com ID ${updateCustomReportDto.author} não encontrado`);
        }
        updatedFields.author = {
          id: user._id,
          name: user.name,
          email: user.email
        };
      } else {
        delete updatedFields.author;
      }
      return await this.customReportModel.findOneAndUpdate(
        { reportIdPB },
        { $set: updatedFields },
        { new: true }
      );
    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`Report with ID ${reportIdPB} not found: ${error.message}`);
      }
      throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
    }
  }

  async remove(reportIdPB: string): Promise<any> {
    try {
      return await this.customReportModel.deleteOne({
        reportIdPB,
      }).exec();

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`Report with ID ${reportIdPB} not found: ${error.message}`);
      }
      throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
    }
  }
}
