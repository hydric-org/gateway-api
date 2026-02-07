import { ChainId } from '@core/enums/chain-id';
import { CoreErrorCode } from '@core/enums/core-error-code';
import { BaseError } from './base-core-error';

export class TokenNotFoundError extends BaseError<{ tokenAddress: string; chainId: number }> {
  constructor(params: { tokenAddress: string; chainId: ChainId }) {
    super({
      errorCode: CoreErrorCode.TOKEN_NOT_FOUND,
      message: "Couldn't find the specified token at the specified chain",
      details: `Token with address '${params.tokenAddress}' at chain id '${params.chainId}' not found`,
      metadata: { tokenAddress: params.tokenAddress, chainId: params.chainId },
    });
  }
}
