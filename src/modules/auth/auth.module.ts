// Auth Module - модуль авторизации
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UserOrmEntity } from '../../infrastructure/database/entities/user.orm-entity';

// Use Cases
import {
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    ValidateUserUseCase,
    GetCurrentUserUseCase,
} from '../../core/use-cases/auth';
import { CreateUserUseCase } from '../../core/use-cases/user/create-user.use-case';

// Infrastructure
import {
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
} from '../../infrastructure/auth';

// Repositories
import { TypeOrmUserRepository } from '../../infrastructure/database/repositories/typeorm-user.repository';
import { USER_REPOSITORY } from '../../core/repositories/user.repository.interface';

// Controllers
import { AuthController } from '../../presentation/controllers/auth.controller';

@Module({
    imports: [
        // Passport
        PassportModule.register({ defaultStrategy: 'jwt' }),

        // JWT Module
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
                },
            }),
        }),

        // TypeORM
        TypeOrmModule.forFeature([UserOrmEntity]),
    ],
    controllers: [AuthController],
    providers: [
        // Strategies
        JwtStrategy,
        JwtRefreshStrategy,

        // Guards
        JwtAuthGuard,

        // Use Cases
        LoginUseCase,
        RegisterUseCase,
        RefreshTokenUseCase,
        ValidateUserUseCase,
        GetCurrentUserUseCase,
        CreateUserUseCase,

        // Repositories
        {
            provide: USER_REPOSITORY,
            useClass: TypeOrmUserRepository,
        },
    ],
    exports: [JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
