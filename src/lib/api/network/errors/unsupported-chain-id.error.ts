import { NetworkUtils } from '@core/enums/network';
import { BaseApiError } from '../../error/errors/base-api-error';
import { ValidationErrorCode } from '../../error/validation-error-codes';

export class UnsupportedChainIdError extends BaseApiError {
  constructor(params: { chainId: number }) {
    const supportedChains = NetworkUtils.values().join(', ');

    super({
      message: `Unsupported Chain ID: ${params.chainId}`,
      errorCode: ValidationErrorCode.UNSUPPORTED_CHAIN_ID,
      details: `The provided ID is not supported by this protocol. Supported IDs are: [${supportedChains}].`,
      meta: {
        chainId: params.chainId,
        supportedIds: supportedChains,
      },
    });
  }
}
