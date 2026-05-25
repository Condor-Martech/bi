import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { ReportResponseDto } from "../../reports/dto/create-report.dto";

export class CreateFavouriteDto {
  @ApiProperty({ description: 'UUID do relatório no Power BI.', example: 'a79ff8eb-4582-4dbf-bc9a-9ba4230b1b33' })
  @IsNotEmpty({
    message: 'reportIdPB é campo obrigatório'
  })
  reportIdPB: string;

  @ApiProperty({ description: 'Posição de exibição do favorito na lista (único por usuário).', example: 1 })
  order: number;
}


export class FavoriteResponseDto {
  @ApiProperty({ description: 'Identificador único do favorito no MongoDB.', example: 'd25sa1d51sad51sa5d1sa5d1sa' })
  @IsString()
  _id: string;

  @ApiProperty({ description: 'ID do usuário dono do favorito (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @IsString()
  userID: string;

  @ApiProperty({ description: 'UUID do relatório no Power BI.', example: 'a79ff8eb-4582-4dbf-bc9a-9ba4230b1b33' })
  @IsString()
  reportIdPB: string;

  @ApiProperty({ description: 'Posição de exibição do favorito na lista (único por usuário).', example: 1 })
  order: number;

  @ApiProperty({ description: 'Dados do relatório vinculado, populados via virtual field.', type: ReportResponseDto })
  report: ReportResponseDto;
}
