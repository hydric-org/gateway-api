import { BaseApiError } from '@lib/api/error/errors/base-api-error';
import { ValidationErrorCode } from '@lib/api/error/validation-error-codes';

export class InvalidLiquidityPoolAddressError extends BaseApiError {
  constructor(params: { liquidityPoolAddress: string }) {
    super({
      message: 'The provided liquidity pool address is not valid',
      errorCode: ValidationErrorCode.INVALID_POOL_ADDRESS,
      details: 'A liquidity pool address must either be a valid ethereum address (20-byte) or a v4 pool id (32-byte)',
      meta: {
        liquidityPoolAddress: params.liquidityPoolAddress,
      },
    });
  }
}
