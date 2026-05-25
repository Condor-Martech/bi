import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SkipAuth } from 'src/app/core/auth/skip-auth.decorator';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UsersService } from '../users/users.service';
import { FiltersService } from './filters.service';
import { ApiCommonResponses, ApiNotFound } from 'src/app/core/api/swagger/api.response';
import { Request } from 'express';

@ApiTags('Filters')
@ApiBearerAuth()
@Controller('filters')
export class FiltersController {
  constructor(
    private readonly filtersService: FiltersService,
    private readonly userService: UsersService,
  ) { }

  @Post()
  @SkipAuth()
  @ApiOperation({
    summary: 'Criar filtro',
    description: 'Cria um novo filtro de linha e o associa ao usuário informado.',
  })
  @ApiCreatedResponse({ description: 'Filtro criado com sucesso.' })
  @ApiCommonResponses()
  async create(@Req() req: Request, @Body() createFilterDto: CreateFilterDto) {
    const user = await this.userService.findOne(createFilterDto.userId);

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return this.filtersService.create(createFilterDto);
  }

  @Get()
  @SkipAuth()
  @ApiOperation({
    summary: 'Listar filtros',
    description: 'Retorna todos os filtros cadastrados no sistema.',
  })
  @ApiOkResponse({ description: 'Lista de filtros retornada com sucesso.' })
  @ApiCommonResponses()
  async findAll(@Req() req: Request) {
    const token = req.headers.authorization;
    //const user = await this.authenticator.checkUserAndRole(token);
    return await this.filtersService.findAll();
  }

  @Get(':id')
  @SkipAuth()
  @ApiOperation({
    summary: 'Buscar filtro por ID',
    description: 'Retorna os dados de um filtro específico pelo seu identificador.',
  })
  @ApiParam({ name: 'id', description: 'ID (ObjectId) do filtro.', example: '64a1c2e8f3a4b50012d3e001' })
  @ApiOkResponse({ description: 'Filtro encontrado e retornado com sucesso.' })
  @ApiCommonResponses()
  @ApiNotFound('Filtro não encontrado.')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const token = req.headers.authorization;
    // const user = await this.authenticator.checkUserAndRole(token);
    return await this.filtersService.findOne(id);
  }

  @Patch('upadate/:id')
  @SkipAuth()
  @ApiOperation({
    summary: 'Atualizar filtro',
    description: 'Atualiza parcialmente os dados de um filtro existente.',
  })
  @ApiParam({ name: 'id', description: 'ID (ObjectId) do filtro a ser atualizado.', example: '64a1c2e8f3a4b50012d3e001' })
  @ApiOkResponse({ description: 'Filtro atualizado com sucesso.' })
  @ApiCommonResponses()
  @ApiNotFound('Filtro não encontrado.')
  async update(@Req() req: Request, @Param('id') id: string, @Body() updateFilterDto: UpdateFilterDto) {
    const token = req.headers.authorization;
    // const user = await this.authenticator.checkUserAndRole(token);
    return await this.filtersService.updateFilter(id, updateFilterDto);
  };

  @Delete('delete/:id')
  @SkipAuth()
  @ApiOperation({
    summary: 'Remover filtro',
    description: 'Remove permanentemente um filtro pelo seu identificador.',
  })
  @ApiParam({ name: 'id', description: 'ID (ObjectId) do filtro a ser removido.', example: '64a1c2e8f3a4b50012d3e001' })
  @ApiOkResponse({ description: 'Filtro removido com sucesso.' })
  @ApiCommonResponses()
  @ApiNotFound('Filtro não encontrado.')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const token = req.headers.authorization;
    //const user = await this.authenticator.checkUserAndRole(token);
    return await this.filtersService.remove(id);
  }

  @Get('tabelas/:id')
  @SkipAuth()
  @ApiOperation({
    summary: 'Listar tabelas de um dataset Power BI',
    description: 'Retorna as tabelas disponíveis em um dataset do Power BI, identificado pelo seu ID. O resultado é cacheado por 6 horas.',
  })
  @ApiParam({ name: 'id', description: 'ID do dataset no Power BI.', example: 'e38e0a0b-d2c6-431c-bd13-6b8ee3360881' })
  @ApiOkResponse({ description: 'Tabelas do dataset retornadas com sucesso.' })
  @ApiCommonResponses()
  async getTables(@Param('id') id: string) {
    const tables = await this.filtersService.getTables(id);
    return tables;
  };

  @Get('get/datasets')
  @SkipAuth()
  @ApiOperation({
    summary: 'Listar datasets Power BI disponíveis',
    description: 'Retorna todos os datasets disponíveis na organização Power BI. O resultado é cacheado por 6 horas.',
  })
  @ApiOkResponse({ description: 'Lista de datasets retornada com sucesso.' })
  @ApiCommonResponses()
  async getDatasets() {
    const tables = await this.filtersService.getDatasets();
    return tables;
  }

  @Get('teste/:id')
  @SkipAuth()
  @ApiExcludeEndpoint()
  async GetDataTest(@Param('id') id: string) {
    const data = await this.filtersService.getPowerBITableData(id);
    return data;
  }
}
