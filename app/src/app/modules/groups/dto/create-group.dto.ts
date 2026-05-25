import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";



export class CreateGroupDto {
    @ApiProperty({ description: 'Nome do workspace/grupo no Power BI', example: 'Workspace Financeiro' })
    @IsNotEmpty({
        message: "Name é campo obrigatório"
    })
    name: string;

    @ApiProperty({ description: 'ID do workspace/grupo no Power BI (GUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @IsNotEmpty({
        message: "Group ID é campo obrigatório"
    })
    groupIdPB: string;

    @ApiProperty({ description: 'Indica se o workspace é somente leitura no Power BI', example: false })
    @IsBoolean()
    isReadOnly: boolean;

    @ApiProperty({ description: 'Indica se o workspace está em capacidade dedicada (Premium)', example: true })
    @IsBoolean()
    isOnDedicatedCapacity: boolean;

    @ApiPropertyOptional({ description: 'Tipo do workspace no Power BI', example: 'Workspace' })
    type: string;

    @ApiPropertyOptional({ description: 'Token de embed gerado para o workspace', example: 'H4sIAAAAAAAEAA...' })
    token?: string;

    @ApiPropertyOptional({ description: 'ID do token de embed', example: 'f2a1b3c4-d5e6-7890-abcd-ef1234567890' })
    tokenId?: string;

    @ApiPropertyOptional({ description: 'Data/hora de expiração do token de embed (ISO 8601)', example: '2024-07-01T12:00:00Z' })
    expiration?: string;

    @ApiPropertyOptional({ description: 'Lista de IDs dos relatórios vinculados ao grupo', example: ['6685a57d6dddeaa56c4a5f15'] })
    reports?: string;

}
