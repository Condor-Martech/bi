import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum AnalysisLanguage {
  PT_BR = 'pt-BR',
  EN_US = 'en-US',
}

export class AnalyzeReportDto {
  @ApiPropertyOptional({
    enum: AnalysisLanguage,
    default: AnalysisLanguage.PT_BR,
    description: 'Idioma do análise narrativo retornado.',
    example: 'pt-BR',
  })
  @IsOptional()
  @IsEnum(AnalysisLanguage)
  language?: AnalysisLanguage;

  @ApiPropertyOptional({
    description: 'Foco específico para guiar o análise (ex.: "vendas no Q1", "performance regional").',
    example: 'vendas no Q1',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  focus?: string;

  @ApiPropertyOptional({
    description: 'Se true, ignora o cache e recomputa o análise.',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  refresh?: boolean;
}
