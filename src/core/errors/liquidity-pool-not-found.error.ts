import { ChainId } from '@core/enums/chain-id';
import { CoreErrorCode } from '@core/enums/core-error-code';
import { BaseError } from './base-core-error';

export class LiquidityPoolNotFoundError extends BaseError {
  constructor(params: { poolAddress: string; chainId: ChainId }) {
    super({
      message: "Couldn't find the specified liquidity pool at the specified chain",
      errorCode: CoreErrorCode.LIQUIDITY_POOL_NOT_FOUND,
      details:
        'No liquidity pool exists for the given address and chain. Verify the liquidity pool address and chain ID are correct',
      metadata: { liquidityPoolAddress: params.poolAddress, chainId: params.chainId },
    });
  }
}
