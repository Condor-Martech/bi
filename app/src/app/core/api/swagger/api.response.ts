import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from './error-response.dto';

/**
 * Respostas de erro comuns a qualquer endpoint protegido e validado.
 *
 * Cobre falhas de autenticação (401), autorização por papel (403),
 * validação de payload (400) e erros internos (500). Aplique em todos os
 * endpoints que passam por `JwtAuthGuard` + `RolesGuard`.
 */
export function ApiCommonResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Requisição inválida — payload mal formado ou reprovado na validação.',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Não autorizado — token JWT ausente, inválido ou expirado.',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Proibido — o papel (role) do usuário não permite esta operação.',
      type: ErrorResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description: 'Erro interno do servidor.',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * Resposta 404 para endpoints que recebem um identificador na rota.
 * Use junto a `ApiCommonResponses()` nos endpoints com parâmetro `:id`.
 */
export function ApiNotFound(description = 'Recurso não encontrado.') {
  return applyDecorators(ApiNotFoundResponse({ description, type: ErrorResponseDto }));
}
