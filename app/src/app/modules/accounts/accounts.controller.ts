import { Controller, Get, Post, Body, Param, Delete, Req, UseInterceptors, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccountResponseDto, CreateAccountDto } from './dto/create-account.dto';
import { ApiCommonResponses, ApiNotFound } from '../../core/api/swagger/api.response';
import { SentryInterceptor } from '../../core/sentry/sentry.interceptor';
import { BackupService } from '../../core/services/backup.service';
import { Roles } from '../../core/auth/roles-auth.decorator';
import { JwtAuthGuard } from '../../core/auth/auth.guard';
import { RolesGuard } from '../../core/auth/roles.guard';
import { ROLE_TYPES } from '../users/dto/create-user.dto';
import { AccountsService } from './accounts.service';
import { Request } from 'express';
import { UpdateAccountDto } from './dto/update-account.dto';
import { RestoreBackupDto } from './dto/restore-backup.dto';

@ApiTags('Accounts')
@UseInterceptors(SentryInterceptor)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly backupService: BackupService,

  ) { }

  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criação de nova conta BI',
    description: 'Cria uma nova conta Azure AD/Power BI (tenant). Após a criação, o usuário autenticado é automaticamente vinculado à conta. Restrito ao papel MANAGER.',
  })
  @ApiCreatedResponse({ description: 'Conta criada com sucesso.', type: AccountResponseDto })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async create(@Body() createAccountDto: CreateAccountDto, @Req() req: Request) {
    const user = req.user
    const account = await this.accountsService.create(createAccountDto);
    await this.accountsService.addUserToAccount(account._id, user.id)
    return account
  };

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todas as contas BI cadastradas',
    description: 'Retorna a lista completa de contas Azure AD/Power BI registradas no sistema. Inclui contagem de usuários vinculados. Acessível por MANAGER e ADMIN (ADMIN precisa para popular o dropdown de cuenta BI ao criar usuários).',
  })
  @ApiOkResponse({ description: 'Lista de contas retornada com sucesso.', type: [AccountResponseDto] })
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER, ROLE_TYPES.ADMIN)
  async findAll(@Req() req: Request) {
    return this.accountsService.findAllAccounts();
  };

  // Declarado ANTES de @Get(':id') — Express matcha por ordem; ':id' capturaria 'backups'.
  @Get('backups')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar conta pelo ID',
    description: 'Retorna os dados de uma conta BI específica pelo seu identificador MongoDB. Também inclui a contagem de usuários vinculados. Restrito ao papel MANAGER.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB da conta BI', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Conta encontrada com sucesso.', type: AccountResponseDto })
  @ApiNotFound('Conta não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async findOne(@Param('id') id: string) {
    const account = await this.accountsService.getIdAccount(id);
    account.userCount = await this.accountsService.getUserCount(account._id);
    return account
  };

  @Get('email/:email')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar conta pelo e-mail',
    description: 'Retorna os dados de uma conta BI a partir do e-mail Azure AD cadastrado. Também inclui a contagem de usuários vinculados. Restrito ao papel MANAGER.',
  })
  @ApiParam({ name: 'email', description: 'E-mail Azure AD da conta BI', example: 'bi@empresa.onmicrosoft.com' })
  @ApiOkResponse({ description: 'Conta encontrada com sucesso.', type: AccountResponseDto })
  @ApiNotFound('Conta com o e-mail informado não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async findByEmail(@Param('email') email: string) {
    const account = await this.accountsService.getBiAccount(email);
    account.userCount = await this.accountsService.getUserCount(account._id);
    return account;
  };

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar conta BI',
    description: 'Atualiza parcialmente os dados de uma conta BI existente. Apenas os campos enviados no body serão alterados. Restrito ao papel MANAGER.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB da conta BI a ser atualizada', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Conta atualizada com sucesso.', type: AccountResponseDto })
  @ApiNotFound('Conta não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async updateAccount(@Body() updateDto: UpdateAccountDto, @Param('id') id: string) {
    return await this.accountsService.updateAccount(id, updateDto);
  };

  @Post('backup')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async createBackup() {
    const file = await this.backupService.backup();
    return { file };
  }

  @Post('restore')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async restoreBack(@Body() dto: RestoreBackupDto) {
    await this.backupService.restoreBackup(dto.fileName);
    return { restored: dto.fileName };
  };

  @Delete(":id/user/:userID")
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover usuário de uma conta',
    description: 'Desvincula um usuário de uma conta BI pelo ID da conta e pelo ID do usuário. Restrito ao papel MANAGER.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB da conta BI', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiParam({ name: 'userID', description: 'ID MongoDB do usuário a ser removido da conta', example: '6685a57d6dddeaa56c4a5f99' })
  @ApiOkResponse({ description: 'Usuário removido da conta com sucesso.' })
  @ApiNotFound('Conta ou usuário não encontrado.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async removeUserFromAccount(@Param('id') id: string, @Param('userID') userID: string) {
    return await this.accountsService.removeUserFromAccount(id, userID);
  };

  @Delete("remove/:id")
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir conta BI',
    description: 'Remove permanentemente uma conta Azure AD/Power BI do sistema pelo seu ID. Restrito ao papel MANAGER.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB da conta BI a ser excluída', example: '6685a57d6dddeaa56c4a5f15' })
  @ApiOkResponse({ description: 'Conta excluída com sucesso.' })
  @ApiNotFound('Conta não encontrada.')
  @ApiCommonResponses()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_TYPES.MANAGER)
  async remove(@Param('id') id: string) {
    return await this.accountsService.removeAccount(id);
  };

}
