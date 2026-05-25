import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { FavouritesService } from './favourites.service';
import { CreateFavouriteDto, FavoriteResponseDto } from './dto/create-favourite.dto';
import { UpdateFavouriteDto } from './dto/update-favourite.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/app/core/auth/auth.guard';
import { RolesGuard } from 'src/app/core/auth/roles.guard';
import { ROLE_TYPES } from '../users/dto/create-user.dto';
import { Roles } from 'src/app/core/auth/roles-auth.decorator';
import { ApiCommonResponses, ApiNotFound } from 'src/app/core/api/swagger/api.response';

@ApiTags('Favourites')
@Controller('favourites')
export class FavouritesController {
  constructor(
    private readonly favouritesService: FavouritesService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Adicionar relatório aos favoritos',
    description:
      'Cria um novo favorito associando um relatório do Power BI a um usuário. O campo `order` define a posição de exibição na lista de favoritos.',
  })
  @ApiCreatedResponse({ description: 'Favorito criado com sucesso.', type: FavoriteResponseDto })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  create(@Req() req: Request, @Body() createFavouriteDto: CreateFavouriteDto) {
    return this.favouritesService.create(req.user.id, createFavouriteDto);
  }

  @Get(':userID')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar favoritos de um usuário',
    description:
      'Retorna todos os favoritos de um usuário, com os dados do relatório populados via virtual field. Ordenados pelo campo `order`.',
  })
  @ApiParam({ name: 'userID', description: 'ID do usuário (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @ApiOkResponse({ description: 'Lista de favoritos retornada com sucesso.', type: [FavoriteResponseDto] })
  @ApiNotFound('Usuário não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  findAll(@Req() req: Request) {
    return this.favouritesService.findAll(req.user.id);
  }

  @Get(':favouriteId/user/:userId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar favorito específico de um usuário',
    description:
      'Retorna um único favorito identificado pelo `favouriteId`, validando que pertence ao `userId` informado.',
  })
  @ApiParam({ name: 'favouriteId', description: 'ID do favorito (ObjectId do MongoDB).', example: 'd25sa1d51sad51sa5d1sa5d1sa' })
  @ApiParam({ name: 'userId', description: 'ID do usuário proprietário do favorito (ObjectId do MongoDB).', example: '6685a5946dddeaa56c4a5f1d' })
  @ApiOkResponse({ description: 'Favorito encontrado com sucesso.', type: FavoriteResponseDto })
  @ApiNotFound('Favorito não encontrado para este usuário.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  findOne(@Req() req: Request, @Param('favouriteId') favouriteId: string) {
    return this.favouritesService.findOne(favouriteId, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar favorito',
    description:
      'Atualiza parcialmente um favorito identificado pelo `id`. Normalmente usado para reordenar favoritos (`order`).',
  })
  @ApiParam({ name: 'id', description: 'ID do favorito (ObjectId do MongoDB).', example: 'd25sa1d51sad51sa5d1sa5d1sa' })
  @ApiOkResponse({ description: 'Favorito atualizado com sucesso.', type: FavoriteResponseDto })
  @ApiNotFound('Favorito não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  update(@Req() req: Request, @Param('id') id: string, @Body() updateFavouriteDto: UpdateFavouriteDto) {
    return this.favouritesService.update(id, req.user.id, updateFavouriteDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover favorito',
    description:
      'Remove permanentemente um favorito identificado pelo `id`. A operação não pode ser desfeita.',
  })
  @ApiParam({ name: 'id', description: 'ID do favorito (ObjectId do MongoDB).', example: 'd25sa1d51sad51sa5d1sa5d1sa' })
  @ApiOkResponse({ description: 'Favorito removido com sucesso.' })
  @ApiNotFound('Favorito não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.USER, ROLE_TYPES.ADMIN)
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.favouritesService.remove(id, req.user.id);
  }
}
