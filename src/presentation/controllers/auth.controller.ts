// Auth Controller - эндпоинты для авторизации
import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';

import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { RefreshTokenDto } from '../dto/auth/refresh-token.dto';
import { TokenResponseDto } from '../dto/auth/token-response.dto';
import { RegisterResponseDto } from '../dto/auth/register-response.dto';
import { UserResponseDto } from '../dto/user/user-response.dto';

import { LoginUseCase } from '../../core/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../../core/use-cases/auth/register.use-case';
import { RefreshTokenUseCase } from '../../core/use-cases/auth/refresh-token.use-case';
import { GetCurrentUserUseCase } from '../../core/use-cases/auth/get-current-user.use-case';

import { Public } from '../../infrastructure/auth/decorators/public.decorator';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { User } from '../../core/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    ) {}

    /**
     * Регистрация нового пользователя
     * POST /auth/register
     */
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        const result = await this.registerUseCase.execute({
            name: dto.name,
            email: dto.email,
            password: dto.password,
        });

        return new RegisterResponseDto({
            user: UserResponseDto.fromEntity(result.user),
            tokens: new TokenResponseDto(result.tokens),
        });
    }

    /**
     * Вход в систему
     * POST /auth/login
     */
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
        const tokens = await this.loginUseCase.execute({
            email: dto.email,
            password: dto.password,
        });

        return new TokenResponseDto(tokens);
    }

    /**
     * Обновление access token через refresh token
     * POST /auth/refresh
     */
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
        const tokens = await this.refreshTokenUseCase.execute({
            refreshToken: dto.refreshToken,
        });

        return new TokenResponseDto(tokens);
    }

    /**
     * Получение профиля текущего пользователя
     * GET /auth/me
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
        const currentUser = await this.getCurrentUserUseCase.execute({ user });
        return UserResponseDto.fromEntity(currentUser);
    }
}
