/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Use Case - вход пользователя в систему
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async execute(input: LoginInput): Promise<TokenResponse> {
        // 1. Найти пользователя по email
        const user = await this.userRepository.findByEmail(input.email.toLowerCase());

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // 2. Проверить пароль
        const isPasswordValid = user.comparePassword(input.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // 3. Генерация JWT токенов
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '3d'),
            secret: this.configService.get<string>('JWT_SECRET'),
        } as any);

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '6d'),
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        } as any);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 минут в секундах
            tokenType: 'Bearer',
        };
    }
}
