/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Use Case - обновление access token через refresh token
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { TokenResponse } from './login.use-case';

export interface RefreshTokenInput {
    refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async execute(input: RefreshTokenInput): Promise<TokenResponse> {
        try {
            // 1. Верифицируем refresh token
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const payload = this.jwtService.verify(input.refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // 2. Проверяем существование пользователя
            const user = await this.userRepository.findById(payload.sub);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // 3. Генерируем новые токены
            const newPayload = {
                sub: user.id,
                email: user.email,
                name: user.name,
            };

            const accessToken = this.jwtService.sign(newPayload, {
                expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
                secret: this.configService.get<string>('JWT_SECRET'),
            } as any);

            const refreshToken = this.jwtService.sign(newPayload, {
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            } as any);

            return {
                accessToken,
                refreshToken,
                expiresIn: 900,
                tokenType: 'Bearer',
            };
        } catch (error) {
            throw new UnauthorizedException(`Invalid refresh token. Error: ${error.message}`);
        }
    }
}
