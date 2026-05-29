import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, Res, Req, BadRequestException } from '@nestjs/common';
import { MapsService } from './maps.service';
import { CreateMapDto } from './create-map.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { put } from '@vercel/blob';
import { ApiCommonResponses, ApiNotFound } from '../../core/api/swagger/api.response';


@ApiTags('Maps')
@ApiBearerAuth()
@Controller('maps')
export class MapsController {
  constructor(
    private readonly mapsService: MapsService
  ) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter(req, file, callback) {
        const allowed = process.env.MULTER_TYPES;
        if (allowed.includes(file.mimetype)) {
          return callback(null, true)
        } else {
          req.fileValidationError = `Apenas os arquivos ${process.env.MULTER_TYPES} são aceitos`
          return callback(null, false)
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Fazer upload de mapa',
    description: 'Recebe um arquivo de imagem de mapa via multipart/form-data, faz upload para o Vercel Blob storage e retorna o registro criado com a URL pública de acesso. Os tipos de arquivo aceitos são definidos pela variável de ambiente MULTER_TYPES.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'name'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem do mapa.',
        },
        name: {
          type: 'string',
          description: 'Nome de exibição do mapa.',
          example: 'Mapa de Vendas por Região',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Mapa enviado e cadastrado com sucesso.' })
  @ApiCommonResponses()
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: any, @Req() req: any, @Body() input: any): Promise<any> {
    if (!file && req.fileValidationError) {
      throw new BadRequestException(`Arquivo é invalido, arquivos permitidos são ${process.env.MULTER_TYPES}`)
    };
    const fileNameSplit = file.originalname.split(".");
    const fileExt = fileNameSplit[fileNameSplit.length - 1];
    const blob = await put(`maps/${Date.now()}.${fileExt}`, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
    });
    const createDto: CreateMapDto = { ...input };
    createDto.webUrl = blob.url;
    const linkMap = await this.mapsService.create(createDto);
    res.status(201).send({ linkMap });
  };

  @Get('all')
  @ApiOperation({
    summary: 'Listar mapas',
    description: 'Retorna todos os mapas cadastrados no sistema.',
  })
  @ApiOkResponse({ description: 'Lista de mapas retornada com sucesso.' })
  @ApiCommonResponses()
  async findAll() {
    return await this.mapsService.findAll();
  };

  @Get('id/:id')
  @ApiOperation({
    summary: 'Buscar mapa por ID',
    description: 'Retorna os dados de um mapa específico pelo seu identificador.',
  })
  @ApiParam({ name: 'id', description: 'ID (ObjectId) do mapa.', example: '64a1c2e8f3a4b50012d3e099' })
  @ApiOkResponse({ description: 'Mapa encontrado e retornado com sucesso.' })
  @ApiCommonResponses()
  @ApiNotFound('Mapa não encontrado.')
  async findOne(@Param('id') id: string) {
    return await this.mapsService.findOne(id);
  };

}
