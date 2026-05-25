import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DaxQueryDto {
  @ApiProperty({ description: 'Propósito declarado pelo modelo para esta query.', example: 'Total de vendas por mês' })
  purpose: string;

  @ApiProperty({ description: 'Query DAX executada.', example: 'EVALUATE TOPN(12, SUMMARIZECOLUMNS(...))' })
  query: string;

  @ApiProperty({ description: 'Quantidade de linhas retornadas pela API Power BI.', example: 12 })
  rowCount: number;

  @ApiPropertyOptional({ description: 'true se as linhas devolvidas ao modelo foram truncadas pelo cap configurado.' })
  truncated?: boolean;

  @ApiPropertyOptional({
    description: 'Amostra de linhas persistida para trazabilidade.',
    type: 'array',
    items: { type: 'object' },
  })
  sampleRows?: any[];

  @ApiPropertyOptional({ description: 'Mensagem de erro se a query falhou.' })
  error?: string;
}

export class AnalysisUsageDto {
  @ApiProperty({ example: 3500 }) promptTokens: number;
  @ApiProperty({ example: 600 }) completionTokens: number;
  @ApiProperty({ example: 4100 }) totalTokens: number;

  @ApiProperty({ example: 0.0009, description: 'Estimativa de custo em USD.' })
  estimatedCostUsd: number;

  @ApiProperty({ example: 'gpt-4o-mini' })
  model: string;
}

export class AnalysisResponseDto {
  @ApiProperty({ description: 'reportIdPB analisado.', example: '6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
  reportId: string;

  @ApiProperty({ description: 'ID MongoDB do registro de análise.', example: '6685a57d6dddeaa56c4a5f15' })
  analysisId: string;

  @ApiProperty({ description: 'Timestamp ISO do análise.', example: '2026-05-22T19:13:10.000Z' })
  generatedAt: string;

  @ApiProperty({ description: 'Idioma do análise.', example: 'pt-BR' })
  language: string;

  @ApiProperty({ description: 'Resumo executivo do análise.' })
  summary: string;

  @ApiProperty({ description: 'Lista de achados principais.', type: [String] })
  keyFindings: string[];

  @ApiProperty({ description: 'Lista de anomalias detectadas.', type: [String] })
  anomalies: string[];

  @ApiProperty({ description: 'Lista de recomendações acionáveis.', type: [String] })
  recommendations: string[];

  @ApiProperty({ description: 'Queries DAX executadas e seus resultados (trazabilidade).', type: [DaxQueryDto] })
  daxQueries: DaxQueryDto[];

  @ApiProperty({ description: 'Uso de tokens e estimativa de custo.', type: AnalysisUsageDto })
  usage: AnalysisUsageDto;

  @ApiProperty({ description: 'true se o resultado veio do cache Redis.' })
  cached: boolean;

  @ApiProperty({ description: "'success' | 'partial' | 'failed'", example: 'success' })
  status: string;
}
