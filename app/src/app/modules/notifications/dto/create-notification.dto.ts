import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateNotificationDto {
  @ApiProperty({ description: 'Título exibido na notificação.', example: 'Novo relatório disponível' })
  @IsNotEmpty({
    message: 'title é campo obrigatório'
  })
  title: string;

  @ApiProperty({ description: 'Corpo da mensagem da notificação.', example: 'O relatório "Vendas Q2" foi publicado e já está disponível para você.' })
  @IsNotEmpty({
    message: 'message é campo obrigatório'
  })
  message: string;
}


export class NotificationResponseDto {
  @ApiProperty({ description: 'Identificador único da notificação no MongoDB.', example: '6685a5946dddeaa56c4a5f1d' })
  @IsString()
  _id: string;

  @ApiProperty({ description: 'Título exibido na notificação.', example: 'Novo relatório disponível' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Corpo da mensagem da notificação.', example: 'O relatório "Vendas Q2" foi publicado e já está disponível para você.' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'ID do usuário destinatário da notificação (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @IsString()
  userID: string;

  @ApiProperty({ description: 'Indica se o usuário já leu a notificação.', example: false })
  @IsBoolean()
  readme: boolean;

  @ApiProperty({ description: 'Data e hora de criação da notificação (UTC).', example: '2024-07-04T15:00:00.000Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Data e hora da última atualização da notificação (UTC).', example: '2024-07-04T15:00:00.000Z' })
  @IsDate()
  updatedAt: Date;
}
