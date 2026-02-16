// JWT Strategy - валидация access token
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ValidateUserUseCase } from '../../../core/use-cases/auth/validate-user.use-case';
import { User } from '../../../core/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly validateUserUseCase: ValidateUserUseCase,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any): Promise<User> {
        // payload содержит данные из JWT токена: { sub: userId, email: ..., name: ... }
        
        // Валидируем пользователя через use-case
        const user = await this.validateUserUseCase.execute({
            userId: payload.sub,
        });

        if (!user) {
            throw new UnauthorizedException('User not found or token is invalid');
        }

        // Возвращаемый объект будет доступен в request.user
        return user;
    }
}
