import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from 'src/infrastructure/auth/jwt.strategy';

/** Protege un endpoint exigiendo Bearer token válido (estrategia passport-jwt). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/** Extrae el payload del JWT verificado (request.user) en los controladores. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
