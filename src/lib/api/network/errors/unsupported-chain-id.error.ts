import { ChainIdUtils } from '@core/enums/chain-id';
import { ValidationErrorCode } from '../../error/error-codes/validation-error-codes';
import { BaseApiError } from '../../error/errors/base-api-error';

export class UnsupportedChainIdError extends BaseApiError {
  constructor(params: { chainId: number }) {
    const supportedChains = ChainIdUtils.values().join(', ');

    super({
      message: `Unsupported Chain ID: ${params.chainId}`,
      errorCode: ValidationErrorCode.UNSUPPORTED_CHAIN_ID,
      details: `The provided ID is not supported by this protocol. Supported IDs are: [${supportedChains}].`,
      metadata: {
        chainId: params.chainId,
        supportedIds: supportedChains,
      },
    });
  }
}
