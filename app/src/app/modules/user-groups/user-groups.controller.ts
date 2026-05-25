import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserGroupDto, UserGroupResponseDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { ApiCommonResponses, ApiNotFound } from 'src/app/core/api/swagger/api.response';
import { Roles } from 'src/app/core/auth/roles-auth.decorator';
import { JwtAuthGuard } from 'src/app/core/auth/auth.guard';
import { RolesGuard } from 'src/app/core/auth/roles.guard';
import { UserGroupsService } from './user-groups.service';
import { ROLE_TYPES } from '../users/dto/create-user.dto';


@ApiTags('User-Groups')
@Controller('user-groups')
export class UserGroupsController {
  constructor(
    private readonly userGroupsService: UserGroupsService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo grupo de usuários',
    description: 'Cria um novo grupo de usuários associado a uma conta BI. Restrito a MANAGER.',
  })
  @ApiCreatedResponse({ description: 'Grupo de usuários criado com sucesso.', type: UserGroupResponseDto })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async create(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupsService.create(createUserGroupDto);
  };

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os grupos de usuários',
    description: 'Retorna a lista completa de grupos de usuários cadastrados. Restrito a MANAGER.',
  })
  @ApiOkResponse({ description: 'Lista de grupos retornada com sucesso.', type: [UserGroupResponseDto] })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async findAll() {
    return this.userGroupsService.findAll();
  };

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar grupo de usuários por ID',
    description: 'Retorna os dados de um grupo de usuários específico a partir do seu ID MongoDB. Restrito a MANAGER.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB do grupo de usuários', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Grupo de usuários encontrado com sucesso.', type: UserGroupResponseDto })
  @ApiNotFound('Grupo de usuários não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async findOne(@Param('id') id: string) {
    return this.userGroupsService.findOne(id);
  };

  @Patch(':groupId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar dados do grupo de usuários',
    description: 'Atualiza nome, conta BI e/ou lista de relatórios do grupo. Campos omitidos permanecem inalterados. Restrito a MANAGER.',
  })
  @ApiParam({ name: 'groupId', description: 'ID MongoDB do grupo de usuários', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Grupo de usuários atualizado com sucesso.', type: UserGroupResponseDto })
  @ApiNotFound('Grupo de usuários não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async updateGroupReports(
    @Param('groupId') groupId: string,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
  ) {
    const update = await this.userGroupsService.updateGroupReports(groupId, updateUserGroupDto);
    return update;
  };

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar grupo de usuários',
    description: 'Remove permanentemente o grupo de usuários identificado pelo ID. Restrito a MANAGER.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB do grupo de usuários a ser removido', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Grupo de usuários removido com sucesso.' })
  @ApiNotFound('Grupo de usuários não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async remove(@Param('id') id: string) {
    return this.userGroupsService.remove(id);
  }
}
