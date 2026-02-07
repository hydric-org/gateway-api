import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode, ApiErrorCodeUtils } from './api-error-codes';

describe('ApiErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(ApiErrorCode.LIQUIDITY_POOL_NOT_FOUND).toBe('LIQUIDITY_POOL_NOT_FOUND');
    expect(ApiErrorCode.TOKEN_NOT_FOUND).toBe('TOKEN_NOT_FOUND');
    expect(ApiErrorCode.TOKEN_BASKET_NOT_FOUND).toBe('TOKEN_BASKET_NOT_FOUND');
    expect(ApiErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ApiErrorCode.INVALID_POOL_ADDRESS).toBe('INVALID_POOL_ADDRESS');
    expect(ApiErrorCode.UNSUPPORTED_CHAIN_ID).toBe('UNSUPPORTED_CHAIN_ID');
    expect(ApiErrorCode.INVALID_PAGINATION_CURSOR).toBe('INVALID_PAGINATION_CURSOR');
    expect(ApiErrorCode.INVALID_BLOCKCHAIN_ADDRESS).toBe('INVALID_BLOCKCHAIN_ADDRESS');
    expect(ApiErrorCode.INVALID_PROTOCOL_ID).toBe('INVALID_PROTOCOL_ID');
    expect(ApiErrorCode.INVALID_BASKET_ID).toBe('INVALID_BASKET_ID');
    expect(ApiErrorCode.API_KEY_DISABLED).toBe('API_KEY_DISABLED');
    expect(ApiErrorCode.API_KEY_EXPIRED).toBe('API_KEY_EXPIRED');
    expect(ApiErrorCode.API_KEY_NOT_FOUND).toBe('API_KEY_NOT_FOUND');
    expect(ApiErrorCode.API_KEY_INVALID).toBe('API_KEY_INVALID');
    expect(ApiErrorCode.API_KEY_MISSING).toBe('API_KEY_MISSING');
    expect(ApiErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    expect(ApiErrorCode.ROUTE_NOT_FOUND).toBe('ROUTE_NOT_FOUND');
    expect(ApiErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    expect(ApiErrorCode.HTTP_EXCEPTION).toBe('HTTP_EXCEPTION');
  });

  describe('ApiErrorCodeUtils mappings', () => {
    const testMapping = (
      code: Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>,
      status: number,
      title: string,
      description: string,
    ) => {
      describe(code, () => {
        it(`should map to status code ${status}`, () => {
          expect(ApiErrorCodeUtils.toStatusCode[code]).toBe(status);
        });

        it(`should map to title "${title}"`, () => {
          expect(ApiErrorCodeUtils.toTitle[code]).toBe(title);
        });

        it('should map to the correct description', () => {
          expect(ApiErrorCodeUtils.toDescription[code]).toBe(description);
        });
      });
    };

    testMapping(
      'LIQUIDITY_POOL_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      'Not Found',
      'The requested liquidity pool could not be found. This may occur if the pool is not yet indexed or the address is incorrect for the specified network.',
    );

    testMapping(
      'TOKEN_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      'Not Found',
      'The requested token could not be located. Ensure the token address and chain ID are correct.',
    );

    testMapping(
      'INVALID_POOL_ADDRESS',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'The provided pool address is syntactically invalid or does not match the expected format for the target blockchain',
    );

    testMapping(
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'The request payload contains invalid data types or malformed parameters',
    );

    testMapping(
      'ROUTE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      'Route Not Found',
      'The requested endpoint does not exist. Please refer to the hydric API reference for valid routes.',
    );

    testMapping(
      'UNSUPPORTED_CHAIN_ID',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'hydric does not currently support or index the provided Chain ID',
    );

    testMapping(
      'INVALID_PAGINATION_CURSOR',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'The pagination cursor is malformed or has expired. Request a new starting page to reset.',
    );

    testMapping(
      'INVALID_BLOCKCHAIN_ADDRESS',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'The provided blockchain identity (address/chain id pair) is malformed or refers to an unsupported network.',
    );

    testMapping(
      'UNKNOWN_ERROR',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Unknown Error',
      'An internal server error occurred. Please try again later.',
    );

    testMapping(
      'INVALID_PROTOCOL_ID',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'The protocol identifier is not recognized. Protocol IDs must match the hydric slug format (e.g., uniswap-v3).',
    );

    testMapping(
      'API_KEY_DISABLED',
      HttpStatus.FORBIDDEN,
      'Authentication Failed',
      'The provided API key exists but is disabled.',
    );

    testMapping(
      'API_KEY_EXPIRED',
      HttpStatus.FORBIDDEN,
      'Authentication Failed',
      'The provided API key exists but has expired.',
    );

    testMapping(
      'API_KEY_NOT_FOUND',
      HttpStatus.UNAUTHORIZED,
      'Authentication Failed',
      'The provided API key does not exist.',
    );

    testMapping(
      'API_KEY_INVALID',
      HttpStatus.UNAUTHORIZED,
      'Authentication Failed',
      'The provided API key is not valid.',
    );

    testMapping(
      'API_KEY_MISSING',
      HttpStatus.UNAUTHORIZED,
      'Authentication Failed',
      'The request lacks an API key. Provide one in the Authorization header.',
    );

    testMapping(
      'INVALID_BASKET_ID',
      HttpStatus.BAD_REQUEST,
      'Invalid Parameters',
      'The provided basket identifier is not one of the supported ones.',
    );

    testMapping(
      'TOKEN_BASKET_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      'Not Found',
      'The requested token basket could not be found.',
    );

    testMapping(
      'RATE_LIMIT_EXCEEDED',
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate Limit Exceeded',
      'You have exceeded the maximum number of requests allowed within the time window. Please wait and retry after the specified duration.',
    );
  });
});
