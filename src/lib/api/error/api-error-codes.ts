import { CoreErrorCode } from '@core/enums/core-error-code';
import { HttpStatus } from '@nestjs/common';
import { ValidationErrorCode } from './validation-error-codes';

export const ApiErrorCode = {
  ...CoreErrorCode,
  ...ValidationErrorCode,
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  HTTP_EXCEPTION: 'HTTP_EXCEPTION',
} as const;

export type ApiErrorCode = keyof typeof ApiErrorCode;

export class ApiErrorCodeUtils {
  static toStatusCode: Record<Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>, number> = {
    POOL_NOT_FOUND: HttpStatus.NOT_FOUND,
    TOKEN_NOT_FOUND: HttpStatus.NOT_FOUND,
    INVALID_POOL_ADDRESS: HttpStatus.BAD_REQUEST,
    VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
    ROUTE_NOT_FOUND: HttpStatus.NOT_FOUND,
    UNSUPPORTED_CHAIN_ID: HttpStatus.BAD_REQUEST,
    INVALID_PAGINATION_CURSOR: HttpStatus.BAD_REQUEST,
    INVALID_TOKEN_ID: HttpStatus.BAD_REQUEST,
    UNKNOWN_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
    INVALID_PROTOCOL_ID: HttpStatus.BAD_REQUEST,
  };

  static toTitle: Record<Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>, string> = {
    POOL_NOT_FOUND: 'Not Found',
    TOKEN_NOT_FOUND: 'Not Found',
    INVALID_POOL_ADDRESS: 'Invalid Parameters',
    VALIDATION_ERROR: 'Invalid Parameters',
    ROUTE_NOT_FOUND: 'Route Not Found',
    UNSUPPORTED_CHAIN_ID: 'Invalid Parameters',
    INVALID_PAGINATION_CURSOR: 'Invalid Parameters',
    INVALID_TOKEN_ID: 'Invalid Parameters',
    UNKNOWN_ERROR: 'Unknown Error',
    INVALID_PROTOCOL_ID: 'Invalid Parameters',
  };
}
