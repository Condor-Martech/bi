import { CreateCustomReportDto, CustomReportResponseDto } from './dto/create-custom-report.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonResponses, ApiNotFound } from 'src/app/core/api/swagger/api.response';
import { UpdateCustomReportDto } from './dto/update-custom-report.dto';
import { CustomReportsService } from './custom-reports.service';
import { Roles } from 'src/app/core/auth/roles-auth.decorator';
import { JwtAuthGuard } from 'src/app/core/auth/auth.guard';
import { RolesGuard } from 'src/app/core/auth/roles.guard';
import { ROLE_TYPES } from '../users/dto/create-user.dto';
import { EventsService } from '../events/events.service';
import { EventActor } from '../events/events.constants';
import { Request } from 'express';

@ApiTags('Custom-Reports')
@Controller('custom-reports')
export class CustomReportsController {
  constructor(
    private readonly customReportsService: CustomReportsService,
    private readonly events: EventsService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar relatório customizado',
    description:
      'Cria um novo relatório customizado com nome, URL e autor. O campo `author` deve ser o ID de um usuário existente no sistema.',
  })
  @ApiCreatedResponse({ description: 'Relatório criado com sucesso.', type: CustomReportResponseDto })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  create(@Body() createCustomReportDto: CreateCustomReportDto) {
    return this.customReportsService.create(createCustomReportDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os relatórios customizados',
    description:
      'Retorna a lista completa de relatórios customizados cadastrados no sistema, com dados do autor populados.',
  })
  @ApiOkResponse({ description: 'Lista de relatórios retornada com sucesso.', type: [CustomReportResponseDto] })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  findAll() {
    return this.customReportsService.findAll();
  }

  @Get(':reportIdPB')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar relatório customizado por UUID do Power BI',
    description:
      'Retorna um único relatório customizado identificado pelo `reportIdPB` (UUID do relatório no Power BI).',
  })
  @ApiParam({ name: 'reportIdPB', description: 'UUID do relatório no Power BI', example: 'b77ea122-2cb2-497a-94c6-f274bb65a127' })
  @ApiOkResponse({ description: 'Relatório encontrado com sucesso.', type: CustomReportResponseDto })
  @ApiNotFound('Relatório customizado não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  async findOne(@Req() req: Request, @Param('reportIdPB') reportIdPB: string) {
    const report = await this.customReportsService.findOne(reportIdPB);
    this.events.trackCustomReportView(buildActor(req), reportIdPB);
    return report;
  }

  @Patch(':reportIdPB')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar relatório customizado por UUID do Power BI',
    description:
      'Atualiza parcialmente um relatório customizado identificado pelo `reportIdPB`. Apenas os campos enviados no body são alterados.',
  })
  @ApiParam({ name: 'reportIdPB', description: 'UUID do relatório no Power BI', example: 'b77ea122-2cb2-497a-94c6-f274bb65a127' })
  @ApiOkResponse({ description: 'Relatório atualizado com sucesso.', type: CustomReportResponseDto })
  @ApiNotFound('Relatório customizado não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  update(@Param('reportIdPB') reportIdPB: string, @Body() updateCustomReportDto: UpdateCustomReportDto) {
    return this.customReportsService.update(reportIdPB, updateCustomReportDto);
  }

  @Delete(':reportIdPB')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir relatório customizado por UUID do Power BI',
    description:
      'Remove permanentemente o relatório customizado identificado pelo `reportIdPB`. A operação não pode ser desfeita.',
  })
  @ApiParam({ name: 'reportIdPB', description: 'UUID do relatório no Power BI', example: 'b77ea122-2cb2-497a-94c6-f274bb65a127' })
  @ApiOkResponse({ description: 'Relatório excluído com sucesso.' })
  @ApiNotFound('Relatório customizado não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  remove(@Param('reportIdPB') reportIdPB: string) {
    return this.customReportsService.remove(reportIdPB);
  }
}

function buildActor(req: Request): EventActor {
  const user: any = req.user || {};
  return {
    userId: user.id || user._id?.toString(),
    email: user.email,
    role: user.role,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}
