// JWT Auth Guard - защита эндпоинтов
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Проверяем, помечен ли эндпоинт как публичный через @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Иначе проверяем JWT токен
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any): any {
        // Кастомная обработка ошибок JWT
        if (err || !user) {
            throw err || new UnauthorizedException('Invalid or expired token');
        }

        return user;
    }
}
