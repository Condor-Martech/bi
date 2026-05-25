import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_KEY } from './skip-auth.decorator';
import { Authenticator } from '../utils/authenticator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authenticator: Authenticator, private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Needs login to use this endpoint');
    }

    const user = await this.authenticator.validateTokenAndGetUser(token);
    request.user = user;

    return true;
  }
}
