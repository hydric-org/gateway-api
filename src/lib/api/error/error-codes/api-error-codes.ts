import { CoreErrorCode } from '@core/enums/core-error-code';
import { HttpStatus } from '@nestjs/common';
import { AuthErrorCode } from './auth-error-codes';
import { ValidationErrorCode } from './validation-error-codes';

export const ApiErrorCode = {
  ...CoreErrorCode,
  ...ValidationErrorCode,
  ...AuthErrorCode,
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  HTTP_EXCEPTION: 'HTTP_EXCEPTION',
} as const;

export type ApiErrorCode = keyof typeof ApiErrorCode;

export class ApiErrorCodeUtils {
  static toStatusCode: Record<Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>, number> = {
    LIQUIDITY_POOL_NOT_FOUND: HttpStatus.NOT_FOUND,
    TOKEN_NOT_FOUND: HttpStatus.NOT_FOUND,
    INVALID_POOL_ADDRESS: HttpStatus.BAD_REQUEST,
    VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
    ROUTE_NOT_FOUND: HttpStatus.NOT_FOUND,
    UNSUPPORTED_CHAIN_ID: HttpStatus.BAD_REQUEST,
    INVALID_PAGINATION_CURSOR: HttpStatus.BAD_REQUEST,
    INVALID_BLOCKCHAIN_ADDRESS: HttpStatus.BAD_REQUEST,
    UNKNOWN_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
    INVALID_PROTOCOL_ID: HttpStatus.BAD_REQUEST,
    API_KEY_DISABLED: HttpStatus.FORBIDDEN,
    API_KEY_EXPIRED: HttpStatus.FORBIDDEN,
    API_KEY_NOT_FOUND: HttpStatus.UNAUTHORIZED,
    API_KEY_INVALID: HttpStatus.UNAUTHORIZED,
    API_KEY_MISSING: HttpStatus.UNAUTHORIZED,
    INVALID_BASKET_ID: HttpStatus.BAD_REQUEST,
    TOKEN_BASKET_NOT_FOUND: HttpStatus.NOT_FOUND,
  };

  static toTitle: Record<Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>, string> = {
    LIQUIDITY_POOL_NOT_FOUND: 'Not Found',
    TOKEN_NOT_FOUND: 'Not Found',
    INVALID_POOL_ADDRESS: 'Invalid Parameters',
    VALIDATION_ERROR: 'Invalid Parameters',
    ROUTE_NOT_FOUND: 'Route Not Found',
    UNSUPPORTED_CHAIN_ID: 'Invalid Parameters',
    INVALID_PAGINATION_CURSOR: 'Invalid Parameters',
    INVALID_BLOCKCHAIN_ADDRESS: 'Invalid Parameters',
    UNKNOWN_ERROR: 'Unknown Error',
    INVALID_PROTOCOL_ID: 'Invalid Parameters',
    API_KEY_DISABLED: 'Authentication Failed',
    API_KEY_EXPIRED: 'Authentication Failed',
    API_KEY_NOT_FOUND: 'Authentication Failed',
    API_KEY_INVALID: 'Authentication Failed',
    API_KEY_MISSING: 'Authentication Failed',
    INVALID_BASKET_ID: 'Invalid Parameters',
    TOKEN_BASKET_NOT_FOUND: 'Not Found',
  };

  static toDescription: Record<Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>, string> = {
    LIQUIDITY_POOL_NOT_FOUND:
      'The requested liquidity pool could not be found. This may occur if the pool is not yet indexed or the address is incorrect for the specified network.',
    TOKEN_NOT_FOUND: 'The requested token could not be located. Ensure the token address and chain ID are correct.',
    INVALID_POOL_ADDRESS:
      'The provided pool address is syntactically invalid or does not match the expected format for the target blockchain',
    VALIDATION_ERROR: 'The request payload contains invalid data types or malformed parameters',
    ROUTE_NOT_FOUND:
      'The requested endpoint does not exist. Please refer to the hydric API reference for valid routes.',
    UNSUPPORTED_CHAIN_ID: 'hydric does not currently support or index the provided Chain ID',
    INVALID_PAGINATION_CURSOR:
      'The pagination cursor is malformed or has expired. Request a new starting page to reset.',
    INVALID_BLOCKCHAIN_ADDRESS:
      'The provided blockchain identity (address/chain id pair) is malformed or refers to an unsupported network.',
    UNKNOWN_ERROR: 'An internal server error occurred. Please try again later.',
    INVALID_PROTOCOL_ID:
      'The protocol identifier is not recognized. Protocol IDs must match the hydric slug format (e.g., uniswap-v3).',
    API_KEY_DISABLED: 'The provided API key exists but is disabled.',
    API_KEY_EXPIRED: 'The provided API key exists but has expired.',
    API_KEY_NOT_FOUND: 'The provided API key does not exist.',
    API_KEY_INVALID: 'The provided API key is not valid.',
    API_KEY_MISSING: 'The request lacks an API key. Provide one in the Authorization header.',
    INVALID_BASKET_ID: 'The provided basket identifier is not one of the supported ones.',
    TOKEN_BASKET_NOT_FOUND: 'The requested token basket could not be found.',
  };
}
