import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors) => {
                const messages = errors.map((error) => ({
                    field: error.property,
                    errors: Object.values(error.constraints || {}),
                }));
                console.log('Validation errors:', messages);
                return new Error(JSON.stringify(messages));
            },
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // CORS (если нужно)
    app.enableCors();

    await app.listen(3000);
    console.log(`🚀 Application is running on: http://localhost:3000`);
}

void bootstrap();
