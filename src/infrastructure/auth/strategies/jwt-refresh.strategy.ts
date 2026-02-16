// JWT Refresh Strategy - валидация refresh token
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ValidateUserUseCase } from '../../../core/use-cases/auth/validate-user.use-case';
import { User } from '../../../core/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private readonly configService: ConfigService,
        private readonly validateUserUseCase: ValidateUserUseCase,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
        });
    }

    async validate(payload: any): Promise<User> {
        // Валидация refresh token
        const user = await this.validateUserUseCase.execute({
            userId: payload.sub,
        });

        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return user;
    }
}
