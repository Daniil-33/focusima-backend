import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { EnvironmentVariables } from './infrastructure/config/env.validation';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validate: (config: Record<string, unknown>) => {
                const validatedConfig = plainToInstance(
                    EnvironmentVariables,
                    config,
                    {
                        enableImplicitConversion: true,
                    },
                );
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
            useFactory: (configService: ConfigService) =>
                getDatabaseConfig(configService),
        }),

        // Feature modules
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
