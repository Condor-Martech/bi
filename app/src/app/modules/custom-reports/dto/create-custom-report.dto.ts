import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UserRelatedResponseDto } from "../../users/dto/create-user.dto";

export class CreateCustomReportDto {
  @ApiProperty({ description: 'Nome de exibição do relatório customizado.', example: 'Dashboard Ecommerce' })
  @IsNotEmpty({
    message: 'name é campo obrigatório'
  })
  name: string;

  @ApiProperty({ description: 'URL pública ou embed do relatório.', example: 'https://app.powerbi.com/view?r=eyJrIjoiZXhhbXBsZSJ9' })
  @IsNotEmpty({
    message: 'url é campo obrigatório'
  })
  url: string;

  @ApiProperty({ description: 'ID do usuário autor do relatório (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @IsNotEmpty({
    message: 'author é campo obrigatório'
  })
  author: string;
}


export class CustomReportResponseDto {
  @ApiProperty({ description: 'Identificador único do documento no MongoDB.', example: '6685a5946dddeaa56c4a5f1d' })
  @IsString()
  _id: string;

  @ApiProperty({ description: 'UUID do relatório no Power BI.', example: 'b77ea122-2cb2-497a-94c6-f274bb65a127' })
  @IsString()
  reportIdPB: string;

  @ApiProperty({ description: 'Nome de exibição do relatório customizado.', example: 'Dashboard Ecommerce' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL pública ou embed do relatório.', example: 'https://app.powerbi.com/view?r=eyJrIjoiZXhhbXBsZSJ9' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Dados do usuário autor do relatório.', type: UserRelatedResponseDto })
  author: UserRelatedResponseDto;
}
