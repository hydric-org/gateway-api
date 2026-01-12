import { CoreErrorCode } from '@core/enums/core-error-code';
import { Network } from '@core/enums/network';
import { BaseError } from './base-core-error';

export class PoolNotFoundError extends BaseError {
  constructor(params: { poolAddress: string; chainId: Network }) {
    super({
      message: "Couldn't find the specified pool at the specified chain",
      errorCode: CoreErrorCode.POOL_NOT_FOUND,
      details: 'No pool exists for the given address and chain. Verify the pool address and chain ID are correct',
      meta: { poolAddress: params.poolAddress, chainId: params.chainId },
    });
  }
}
