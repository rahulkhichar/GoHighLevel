import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    InternalServerErrorException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { performance } from 'perf_hooks';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name); // Logger instance

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const { method, url, body, params, query } = request;
        const startTime = performance.now();

        this.logger.log(`📩 Incoming Request: ${method} ${url}`);

        return next.handle().pipe(
            tap(() => {
                const executionTime = (performance.now() - startTime).toFixed(2);
                this.logger.log(
                    `✅ Response Sent: ${method} ${url} | Status: ${response.statusCode} | ⏱ Execution Time: ${executionTime}ms`,
                );
            }),
            catchError((err) => {
                const executionTime = (performance.now() - startTime).toFixed(2);
                this.logger.error(
                    `❌ Error on ${method} ${url} | Execution Time: ${executionTime}ms`,
                    err.stack,
                );

                if (err.response?.status >= 500) {
                    throw new InternalServerErrorException('Internal Server Error');
                }
                if (err.response?.status >= 400) {
                    throw new BadRequestException(err.response?.message);
                }
                throw err;
            }),
        );
    }
}
