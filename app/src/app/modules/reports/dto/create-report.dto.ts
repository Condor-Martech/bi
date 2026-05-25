import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";
import { AccountRelatedResponseDto } from "../../accounts/dto/create-account.dto";



export class CreateReportDto {

    @ApiProperty({ description: 'ID do relatório no Power BI (GUID)', example: '6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    @IsString()
    reportIdPB: string;

    @ApiPropertyOptional({ description: 'Tipo do relatório no Power BI', example: 'PowerBIReport' })
    @IsString()
    reportType?: string

    @ApiProperty({ description: 'Nome do relatório', example: 'ANÁLISE FINANCEIRA' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'URL de visualização do relatório no Power BI', example: 'https://app.powerbi.com/groups/me/reports/6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    webUrl: string;

    @ApiProperty({ description: 'URL de embed para incorporar o relatório via iframe', example: 'https://app.powerbi.com/reportEmbed?reportId=6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    embedUrl: string;

    @ApiPropertyOptional({ description: 'Indica se o relatório pertence ao usuário autenticado no Power BI', example: true })
    @IsBoolean()
    isOwnedByMe?: boolean;

    @ApiProperty({ description: 'ID do dataset associado ao relatório no Power BI', example: 'f2a1b3c4-d5e6-7890-abcd-ef1234567890' })
    datasetId: string;

    @ApiProperty({ description: 'ID do workspace/grupo ao qual o relatório pertence no Power BI', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    groupIdPB: string;

    @ApiProperty({ description: 'ID MongoDB da conta BI vinculada ao relatório', example: '6685a57d6dddeaa56c4a5f15' })
    accountID: string

    @ApiPropertyOptional({ description: 'Lista de usuários com acesso ao relatório', example: [] })
    users?: [];

    @ApiPropertyOptional({ description: 'Lista de assinaturas associadas ao relatório', example: [] })
    subscriptions?: []

}

export class ReportRelatedResponseDto {

    @ApiProperty({ description: 'ID do relatório no Power BI (GUID)', example: '6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    @IsString()
    reportIdPB: string;

    @ApiProperty({ description: 'Nome do relatório', example: 'ANÁLISE FINANCEIRA' })
    @IsString()
    name: string

    @ApiProperty({ description: 'URL de embed para incorporar o relatório via iframe', example: 'https://app.powerbi.com/reportEmbed?reportId=6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    @IsString()
    embedUrl: string;

    @ApiProperty({ description: 'ID do workspace/grupo ao qual o relatório pertence no Power BI', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    groupIdPB: string;

}

export class ReportResponseDto {

    @ApiProperty({ description: 'ID do relatório no Power BI (GUID)', example: '6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    @IsString()
    reportIdPB: string;

    @ApiProperty({ description: 'Nome do relatório', example: 'ANÁLISE FINANCEIRA' })
    @IsString()
    name: string

    @ApiProperty({ description: 'URL de embed para incorporar o relatório via iframe', example: 'https://app.powerbi.com/reportEmbed?reportId=6e277bac-97e4-43cc-ad65-b96dbdd65f57' })
    @IsString()
    embedUrl: string;

    @ApiProperty({ description: 'ID do workspace/grupo ao qual o relatório pertence no Power BI', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    groupIdPB: string;

    @ApiProperty({ description: 'Dados da conta BI vinculada ao relatório', type: AccountRelatedResponseDto })
    account: AccountRelatedResponseDto

}
