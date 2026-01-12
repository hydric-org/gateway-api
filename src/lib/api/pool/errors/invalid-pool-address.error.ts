import { BaseApiError } from '@lib/api/error/errors/base-api-error';
import { ValidationErrorCode } from '@lib/api/error/validation-error-codes';

export class InvalidPoolAddressError extends BaseApiError {
  constructor(params: { poolAddress: string }) {
    super({
      message: 'The provided pool address is not valid',
      errorCode: ValidationErrorCode.INVALID_POOL_ADDRESS,
      details: 'Pool address must either be a valid ethereum address (20-byte) or a v4 pool id (32-byte)',
      meta: {
        poolAddress: params.poolAddress,
      },
    });
  }
}
