import { Injectable, Logger } from '@nestjs/common';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Filter, FilterDocument } from './entities/filter.entity';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { AccountsService } from '../accounts/accounts.service';
import { CacheService } from '../../core/cache/cache.service';
import { CACHE_TTL, CacheKeys } from '../../core/cache/cache.keys';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class FiltersService {
  private readonly logger = new Logger(FiltersService.name);

  constructor(
    private readonly cache: CacheService,
    @InjectModel(Filter.name) private filterModel: Model<FilterDocument>,
    private readonly userService: UsersService,
    private readonly accounts: AccountsService,
    private readonly http: HttpService
  ) { }

  async create(createFilterDto: CreateFilterDto): Promise<Filter> {
    try {
      const newFilter = new this.filterModel(createFilterDto)
      await newFilter.save();
      if (newFilter) {
        await this.userService.incluedFilter(newFilter.userId, newFilter._id)
      }
      return newFilter;

    } catch (error) {
      this.logger.error(`Erro ao criar filtro: ${error?.message ?? error}`);
    }

  };
  async findAll(): Promise<Filter[]> {
    const filters = await this.filterModel.find();
    return filters;
  };
  async findOne(id: string): Promise<any> {
    const filter = await this.filterModel.findById(id)
    return filter;
  };
  async getDatasets() {
    return this.cache.wrap(
      CacheKeys.filterDatasets(),
      async () => {
        try {
          const email = 'bi@supcondor.onmicrosoft.com'
          const tokenFromDB = await this.accounts.getBiAccount(email);
          const config = {
            headers: {
              Authorization: `Bearer ${tokenFromDB.token}`
            },
          };
          const response = await firstValueFrom(this.http.get(`https://api.powerbi.com/v1.0/myorg/datasets`, config)
            .pipe(map(res => res.data)));
          return response;
        } catch (error) {
          this.logger.error(`Erro ao obter datasets: ${error?.message ?? error}`);
          return { message: 'An error occurred', details: error.message };
        }
      },
      CACHE_TTL.SIX_HOURS,
      // Não cacheia o envelope de erro { message, details }.
      (value: any) => value != null && !value.message,
    );
  }
  async getTables(datasetId: string) {
    return this.cache.wrap(
      CacheKeys.filterTables(datasetId),
      async () => {
        try {
          const email = 'bi@supcondor.onmicrosoft.com'
          const tokenFromDB = await this.accounts.getBiAccount(email);
          const config = {
            headers: {
              Authorization: `Bearer ${tokenFromDB.token}`
            },
          };
          const response = await firstValueFrom(this.http.get(`https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/tables`, config)
            .pipe(map(res => res.data)));
          return response;
        } catch (error) {
          this.logger.error(`Erro ao obter tabelas: ${error?.message ?? error}`);
          return undefined;
        }
      },
      CACHE_TTL.SIX_HOURS,
    );
  }
  async updateFilter(id: string, update: UpdateFilterDto): Promise<any> {

    const changedFilter = await this.filterModel.findByIdAndUpdate(
      { _id: id },
      { $set: update },
      { $currentDate: { lastModified: true } }
    );
    return changedFilter;
  };
  async remove(id: string): Promise<any> {
    return await this.filterModel
      .deleteOne({
        _id: id,
      }).exec();
  };
  async getPowerBITableData(tableId: string) {
    try {
      const email = 'bi@supcondor.onmicrosoft.com'
      const tokenFromDB = await this.accounts.getBiAccount(email);
      const config = {
        headers: {
          Authorization: `Bearer ${tokenFromDB.token}`
        },
      };
      const response = await firstValueFrom(this.http.get(`https://api.powerbi.com/v1.0/myorg/groups/e38e0a0b-d2c6-431c-bd13-6b8ee3360881/reports/99476223-02ee-4599-900b-f4a342457ea7/tables/${tableId}`, config)
        .pipe(map(res => res.data)));


      return response

    } catch (error) {
      this.logger.error(`Erro ao obter dados da tabela: ${error?.message ?? error}`);
    }
  }
}
