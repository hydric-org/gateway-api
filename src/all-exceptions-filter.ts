import { BaseError } from '@core/errors/base-core-error';
import { ApiErrorCode } from '@lib/api/error/api-error-codes';
import { ApiErrorResponseDTO } from '@lib/api/error/dtos/api-error.dto';
import { ErrorMapper } from '@lib/api/error/error-mapper';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
interface TimedRequest extends Request {
  startTime?: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const traceId: string = (request.headers['x-trace-id'] as string) || uuidv4();
    const payload = ErrorMapper.map(exception, request, traceId);

    response.setHeader('x-trace-id', traceId);
    response.setHeader('x-error-code', payload.error?.code || ApiErrorCode.UNKNOWN_ERROR);

    this.logException(exception, payload, request);

    return response.status(payload.statusCode).json(payload);
  }

  private logException(exception: Error, payload: ApiErrorResponseDTO, request: TimedRequest) {
    const { traceId, path, statusCode } = payload;
    const { code, message } = payload.error;

    const clientContext = {
      userAgent: request.headers['user-agent'] || 'unknown',
      ip: request.ip || request.socket.remoteAddress || 'unknown',
    };

    const body: Record<string, unknown> = Number(statusCode) < 500 ? request.body : undefined;

    const context = {
      traceId,
      path,
      method: request.method,
      statusCode,
      code,
      message,
      ...clientContext,
      ...(Object.keys(body || {}).length > 0 && { body }),
    };

    if (exception instanceof BaseError) {
      this.logger.warn('domain_error', context);
      return;
    }

    if (exception instanceof HttpException) {
      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error('http_exception', {
          ...context,
          stack: exception.stack,
        });
      } else {
        this.logger.warn('http_exception', context);
      }
      return;
    }

    this.logger.error('unhandled_exception', {
      ...context,
      message: exception.message,
      stack: exception.stack,
    });
  }
}
