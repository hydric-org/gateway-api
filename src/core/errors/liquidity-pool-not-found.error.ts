import { CoreErrorCode } from '@core/enums/core-error-code';
import { Network } from '@core/enums/network';
import { BaseError } from './base-core-error';

export class LiquidityPoolNotFoundError extends BaseError {
  constructor(params: { poolAddress: string; chainId: Network }) {
    super({
      message: "Couldn't find the specified liquidity pool at the specified chain",
      errorCode: CoreErrorCode.LIQUIDITY_POOL_NOT_FOUND,
      details:
        'No liquidity pool exists for the given address and chain. Verify the liquidity pool address and chain ID are correct',
      meta: { liquidityPoolAddress: params.poolAddress, chainId: params.chainId },
    });
  }
}
