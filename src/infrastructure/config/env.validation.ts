// Environment validation schema
import { IsEnum, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

export class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    PORT: number;

    @IsString()
    DB_HOST: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    DB_PORT: number;

    @IsString()
    DB_USERNAME: string;

    @IsString()
    DB_PASSWORD: string;

    @IsString()
    DB_DATABASE: string;

    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    DB_SYNCHRONIZE: boolean;

    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    DB_LOGGING: boolean;

    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    DB_MIGRATIONS_RUN: boolean;
}
