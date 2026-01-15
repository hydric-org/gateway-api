import { BaseError } from '@core/errors/base-core-error';
import { ApiErrorCode, ApiErrorCodeUtils } from '@lib/api/error/api-error-codes';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Request } from 'express';

export class ErrorMapper {
  static map(exception: Error, request: Request, traceId: string): ErrorResponse {
    const timestamp = new Date().toISOString();
    const requestUrl = request.originalUrl;

    if (exception instanceof BaseError) {
      const statusCode: number = ApiErrorCodeUtils.toStatusCode[exception.params.errorCode] || HttpStatus.BAD_REQUEST;

      return {
        timestamp,
        path: requestUrl,
        traceId,
        statusCode,
        error: {
          code: exception.params.errorCode,
          title: ApiErrorCodeUtils.toTitle[exception.params.errorCode],
          message: exception.message,
          details: exception.params.details,
          metadata: exception.params.metadata,
        },
      };
    }

    if (exception instanceof NotFoundException) {
      const statusCode: number = ApiErrorCodeUtils.toStatusCode[ApiErrorCode.ROUTE_NOT_FOUND] || HttpStatus.NOT_FOUND;

      return {
        timestamp,
        path: requestUrl,
        traceId,
        statusCode,
        error: {
          code: ApiErrorCode.ROUTE_NOT_FOUND,
          title: ApiErrorCodeUtils.toTitle[ApiErrorCode.ROUTE_NOT_FOUND],
          message: 'Route not found',
          details: 'The requested route does not exist',
          metadata: { method: request.method },
        },
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();

      const message =
        typeof res === 'object' && 'message' in res
          ? Array.isArray(res['message'])
            ? res['message'][0]
            : res['message']
          : exception.message;

      const title = typeof res === 'object' && 'error' in res ? String(res['error']) : 'HTTP Exception';

      return {
        timestamp,
        path: requestUrl,
        traceId,
        statusCode,
        error: {
          code: ApiErrorCode.HTTP_EXCEPTION,
          title,
          message: Array.isArray(message) ? String(message[0]) : String(message),
          details: 'An HTTP error occurred while processing the request.',
        },
      };
    }

    return {
      timestamp,
      path: requestUrl,
      traceId,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: ApiErrorCode.UNKNOWN_ERROR,
        title: ApiErrorCodeUtils.toTitle[ApiErrorCode.UNKNOWN_ERROR],
        message: 'An unexpected internal error occurred',
        details: 'The server encountered an unhandled exception',
        metadata: {
          exceptionName: exception.constructor.name,
        },
      },
    };
  }
}
