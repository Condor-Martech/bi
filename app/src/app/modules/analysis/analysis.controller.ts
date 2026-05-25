import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SentryInterceptor } from '../../core/sentry/sentry.interceptor';
import { ApiCommonResponses, ApiNotFound } from '../../core/api/swagger/api.response';
import { JwtAuthGuard } from '../../core/auth/auth.guard';
import { RolesGuard } from '../../core/auth/roles.guard';
import { Roles } from '../../core/auth/roles-auth.decorator';
import { ROLE_TYPES } from '../users/dto/create-user.dto';
import { AnalysisService } from './analysis.service';
import { AnalyzeReportDto } from './dto/analyze-report.dto';
import { AnalysisResponseDto } from './dto/analysis-response.dto';

@ApiTags('Analysis')
@ApiBearerAuth()
@UseInterceptors(SentryInterceptor)
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('report/:reportId')
  @ApiOperation({
    summary: 'Gerar análise narrativa de um relatório Power BI',
    description:
      'Dispara um análise com IA do relatório informado. O backend descobre o schema do dataset, ' +
      'permite que o LLM solicite queries DAX em um loop limitado (máx. 4 rodadas), executa essas queries ' +
      'contra a API executeQueries do Power BI e retorna um análise narrativo (resumo, achados, anomalias, ' +
      'recomendações) com as queries usadas para trazabilidade. Latência típica: 20-60s. Resultado é ' +
      'cacheado em Redis por 6h (use `refresh: true` para forçar recálculo). Restrito ao papel MANAGER ' +
      'porque executeQueries roda com o token de serviço — RLS por usuário não é aplicado.',
  })
  @ApiParam({
    name: 'reportId',
    description: 'reportIdPB do relatório a analisar.',
    example: '6e277bac-97e4-43cc-ad65-b96dbdd65f57',
  })
  @ApiOkResponse({ description: 'Análise gerado (ou recuperado do cache).', type: AnalysisResponseDto })
  @ApiNotFound('Relatório não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async analyze(
    @Req() req: Request,
    @Param('reportId') reportId: string,
    @Body() dto: AnalyzeReportDto,
  ): Promise<AnalysisResponseDto> {
    return this.analysisService.analyzeReport(reportId, (req as any).user, dto ?? ({} as AnalyzeReportDto));
  }

  @Get('all')
  @ApiOperation({
    summary: 'Listar todos os análises (paginado)',
    description:
      'Retorna a lista paginada de TODOS os análises gerados, de todos os relatórios, ordenados por data ' +
      '(mais recentes primeiro). Não inclui o array `daxRuns` completo — use GET /analysis/:id para o documento ' +
      'detalhado. Restrito ao papel MANAGER.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Limite por página (máx 100).' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiOkResponse({ description: 'Lista paginada de análises.' })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.analysisService.getAll(Math.min(limit, 100), skip);
  }

  @Get('report/:reportId/history')
  @ApiOperation({
    summary: 'Listar histórico de análises de um relatório',
    description:
      'Retorna a lista paginada de análises armazenados para o relatório (mais recentes primeiro). ' +
      'Não inclui o array `daxRuns` completo — use GET /analysis/:id para o documento detalhado.',
  })
  @ApiParam({ name: 'reportId', description: 'reportIdPB.', example: '6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiOkResponse({ description: 'Lista paginada de análises.' })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async history(
    @Param('reportId') reportId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.analysisService.getHistory(reportId, Math.min(limit, 100), skip);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar análise pelo ID',
    description: 'Retorna o documento completo de um análise armazenado, incluindo daxRuns e métricas de uso.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB do análise.', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Documento de análise.' })
  @ApiNotFound('Análise não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async findOne(@Param('id') id: string) {
    return this.analysisService.findOne(id);
  }
}
