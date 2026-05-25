import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsString } from "class-validator";


export class CreateUserGroupDto {

  @ApiProperty({ description: 'Nome do grupo de usuários', example: 'Grupo Financeiro' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID da conta BI associada ao grupo', example: '6685a57d6dddeaa56c4a5f15' })
  accountID: string;

  @ApiProperty({ description: 'ID do usuário inicial do grupo', example: '6685a57d6dddeaa56c4a5f15' })
  users: string;

  @ApiProperty({ description: 'Lista de IDs de relatórios Power BI do grupo', type: [String], example: ['6e277bac-97e4-43cc-ad65-b96dbdd65f57'] })
  reports: string[];

}

export class UserGroupResponseDto {

  @ApiProperty({ description: 'ID MongoDB do grupo', example: '6685a57d6dddeaa56c4a5f15' })
  @IsString()
  _id: string;

  @ApiProperty({ description: 'Nome do grupo de usuários', example: 'Grupo Financeiro' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID da conta BI associada ao grupo', example: '6685a57d6dddeaa56c4a5f15' })
  @IsString()
  accountID: string;

  @ApiProperty({ description: 'Lista de IDs de usuários membros do grupo', type: [String], example: ['6685a57d6dddeaa56c4a5f15'] })
  users: string[];

  @ApiProperty({ description: 'Lista de IDs de relatórios Power BI do grupo', type: [String], example: ['6e277bac-97e4-43cc-ad65-b96dbdd65f57'] })
  reports: string[];

  @ApiProperty({ description: 'Data de criação do registro', example: '2023-06-30T15:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização do registro', example: '2023-06-30T15:00:00Z' })
  @IsDate()
  updatedAt: Date;

}


