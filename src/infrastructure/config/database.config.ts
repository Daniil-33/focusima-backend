// Database configuration
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Загружаем .env для CLI команд (миграции)
dotenv.config();

export const getDatabaseConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../../**/*.orm-entity{.ts,.js}'],
    migrations: [
        __dirname + '/../database/migrations/**/*{.ts,.js}',
    ],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    logging: configService.get<boolean>('DB_LOGGING'),
    migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN'),
    ssl:
        configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
});

// DataSource для миграций (CLI)
export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '15432', 10),
    username: process.env.DB_USERNAME || 'focusima_dev_admin',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'focusima_dev',
    entities: [__dirname + '/../../**/*.orm-entity{.ts,.js}'],
    migrations: [
        __dirname + '/../database/migrations/**/*{.ts,.js}',
    ],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
