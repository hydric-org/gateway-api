import { CoreErrorCode } from '@core/enums/core-error-code';
import { Network } from '@core/enums/network';
import { BaseError } from './base-core-error';

export class TokenNotFoundError extends BaseError {
  constructor(params: { tokenAddress: string; chainId: Network }) {
    super({
      errorCode: CoreErrorCode.TOKEN_NOT_FOUND,
      message: "Couldn't find the specified token at the specified chain",
      details: `Token with address '${params.tokenAddress}' at chain id '${params.chainId}' not found`,
      metadata: { tokenAddress: params.tokenAddress, chainId: params.chainId },
    });
  }
}
