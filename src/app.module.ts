import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { EnvironmentVariables } from './infrastructure/config/env.validation';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from './infrastructure/auth/guards/jwt-auth.guard';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validate: (config: Record<string, unknown>) => {
                const validatedConfig = plainToInstance(EnvironmentVariables, config, {
                    enableImplicitConversion: true,
                });
                const errors = validateSync(validatedConfig, {
                    skipMissingProperties: false,
                });

                if (errors.length > 0) {
                    throw new Error(errors.toString());
                }
                return validatedConfig;
            },
        }),

        // Database
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
        }),

        // Feature modules
        AuthModule,
        UserModule,
        AccessControlModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Глобальный JWT Guard - все эндпоинты защищены по умолчанию
        // Используйте @Public() decorator для публичных эндпоинтов
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
