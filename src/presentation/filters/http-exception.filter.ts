// Global Exception Filter
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UserNotFoundException } from '../../core/exceptions/user/user-not-found.exception';
import { UserAlreadyExistsException } from '../../core/exceptions/user/user-already-exists.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.message;
        } else if (exception instanceof UserNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = exception.message;
        } else if (exception instanceof UserAlreadyExistsException) {
            status = HttpStatus.CONFLICT;
            message = exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}
