import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Envelope padrão de erro retornado pela API.
 *
 * Segue o formato de exceções do NestJS: as exceções HTTP nativas incluem
 * `error`; as exceções customizadas (ex.: `InvalidObjectIdException`) retornam
 * apenas `statusCode` e `message`.
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de status HTTP da resposta.',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description:
      'Mensagem de erro. Uma string para erros simples ou uma lista de strings ' +
      'quando se trata de falhas de validação de múltiplos campos.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'ID inválido: 64f0c2a1b3e5d6f7a8b9c0d1',
  })
  message: string | string[];

  @ApiPropertyOptional({
    description: 'Nome curto do erro HTTP. Ausente em exceções customizadas.',
    example: 'Bad Request',
  })
  error?: string;
}
