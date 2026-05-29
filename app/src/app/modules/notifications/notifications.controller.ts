import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Sse, Req, Query, MessageEvent, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, NotificationResponseDto } from './dto/create-notification.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles-auth.decorator';
import { ROLE_TYPES } from '../users/dto/create-user.dto';
import { RolesGuard } from '../../core/auth/roles.guard';
import { JwtAuthGuard } from '../../core/auth/auth.guard';
import { SkipAuth } from '../../core/auth/skip-auth.decorator';
import { SseAuthGuard } from '../../core/auth/sse-auth.guard';
import { Observable, interval, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApiCommonResponses, ApiNotFound } from '../../core/api/swagger/api.response';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar notificação',
    description:
      'Cria uma nova notificação global para ser entregue a usuários via SSE. Restrito a gestores (`MANAGER`).',
  })
  @ApiCreatedResponse({ description: 'Notificação criada com sucesso.', type: NotificationResponseDto })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar notificações do usuário autenticado',
    description:
      'Retorna as notificações do usuário autenticado em ordem decrescente de criação. Suporta paginação via `page` e `limit`. A resposta inclui metadados: `total` e `unread`.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número da página (inicia em 1). Padrão: 1.' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Quantidade de registros por página. Padrão: 20.' })
  @ApiOkResponse({ description: 'Lista paginada de notificações retornada com sucesso.' })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  findAll(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationsService.findAllForUser(req.user.id, page, limit);
  }

  @Sse('stream')
  @SkipAuth()
  @UseGuards(SseAuthGuard)
  @ApiExcludeEndpoint()
  stream(@Req() req): Observable<MessageEvent> {
    const userID = req.user.id;

    const notifications$ = this.notificationsService.getStream().pipe(
      filter(event => event.userID === userID),
      map(event => event.payload)
    );

    // Keep-alive: evita que proxies/load balancers fechem a conexão ociosa.
    const heartbeat$ = interval(25000).pipe(
      map(() => ({ type: 'ping', data: { ts: new Date().toISOString() } } as MessageEvent))
    );

    return merge(notifications$, heartbeat$);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar notificação por ID',
    description:
      'Retorna uma única notificação identificada pelo `id` (ObjectId do MongoDB).',
  })
  @ApiParam({ name: 'id', description: 'ID da notificação (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @ApiOkResponse({ description: 'Notificação encontrada com sucesso.', type: NotificationResponseDto })
  @ApiNotFound('Notificação não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':notificationId/user/:userId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Marcar notificação como lida',
    description:
      'Marca a notificação identificada por `notificationId` como lida (`readme: true`) para o usuário `userId`. Apenas o próprio usuário ou um gestor deve invocar este endpoint.',
  })
  @ApiParam({ name: 'notificationId', description: 'ID da notificação (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @ApiParam({ name: 'userId', description: 'ID do usuário destinatário (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1e' })
  @ApiOkResponse({ description: 'Notificação marcada como lida com sucesso.', type: NotificationResponseDto })
  @ApiNotFound('Notificação não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  update(@Param('userId') userId: string, @Param('notificationId') notificationId: string) {
    return this.notificationsService.update(userId, notificationId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir notificação',
    description:
      'Remove permanentemente a notificação identificada pelo `id`. A operação não pode ser desfeita.',
  })
  @ApiParam({ name: 'id', description: 'ID da notificação (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @ApiOkResponse({ description: 'Notificação excluída com sucesso.' })
  @ApiNotFound('Notificação não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
