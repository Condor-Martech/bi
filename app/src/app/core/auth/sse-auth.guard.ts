import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Authenticator } from '../utils/authenticator';

/**
 * Guard de autenticação para rotas SSE.
 *
 * O EventSource do navegador não permite enviar o header Authorization,
 * portanto o token JWT chega via query param (`?token=<jwt>`).
 * Este guard valida esse token reutilizando o Authenticator e popula
 * `request.user`, do mesmo modo que o JwtAuthGuard global faz nas demais rotas.
 */
@Injectable()
export class SseAuthGuard implements CanActivate {
  constructor(private readonly authenticator: Authenticator) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query?.token;

    if (!token) {
      throw new UnauthorizedException('Token de autenticação ausente na query');
    }

    try {
      // O Authenticator espera o header completo — ele faz split em 'Bearer '.
      const user = await this.authenticator.validateTokenAndGetUser(`Bearer ${token}`);
      request.user = user;
      return true;
    } catch (error) {
      // O Authenticator envolve qualquer falha em InternalServerErrorException (500).
      // Normalizamos para 401, que é o status correto para falha de autenticação.
      throw new UnauthorizedException('Token de autenticação inválido');
    }
  }
}
