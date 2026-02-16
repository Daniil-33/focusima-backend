/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @CurrentUser() decorator - получение текущего пользователя из request
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../core/entities/user.entity';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // User добавляется в request через JwtStrategy
});
