import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { Report, ReportDocument } from '../reports/report.entity';
import { Model, Error as MongooseError } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserGroupDocument, UserGroups } from './user-group.entity';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectModel(UserGroups.name) private userGroupModel: Model<UserGroupDocument>,
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly accountService: AccountsService
  ) { }


  async create(createUserGroupDto: CreateUserGroupDto) {
    try {
      const group = new this.userGroupModel(createUserGroupDto);
      return await group.save();

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`User not found: ${error.message}`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.userGroupModel.find().exec();

    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const group = await this.userGroupModel.findById(id);
      if (!group) {
        throw new NotFoundException(`Group with ID ${id} not found`);
      }
      return group;

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`Report with ID ${id} not found: ${error.message}`);
      }
      throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
    }
  }

  async updateGroupReports(groupId: string, updateUserGroupDto: UpdateUserGroupDto): Promise<UserGroups> {
    try {
      const { name, accountID, reports } = updateUserGroupDto;

      if (reports) {
        const validReports = await this.reportModel.find({ reportIdPB: { $in: reports.map(id => id.toString()) } });
        if (validReports.length !== reports.length) {
          throw new NotFoundException(`One or more reports not found`);
        }
      }
      if (accountID) {
        await this.accountService.getIdAccount(accountID);
      }
      const updateData: any = {};
      if (name) updateData.name = name;
      if (accountID) updateData.accountID = accountID;
      if (reports) updateData.reports = reports;

      const userGroup = await this.userGroupModel.findByIdAndUpdate(groupId, updateData, { new: true });
      if (!userGroup) {
        throw new NotFoundException(`UserGroup with ID ${groupId} not found`);
      }

      // Sem denormalização: os relatórios do grupo são resolvidos em tempo real por
      // PermissionsService a cada request, portanto não há nada a propagar aos usuários.
      return userGroup;
    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      return await this.userGroupModel.deleteOne({
        _id: id,
      }).exec();

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`Report with ID ${id} not found: ${error.message}`);
      }
      throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
    }

  }
}
