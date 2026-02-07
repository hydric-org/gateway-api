import { ChainIdUtils } from '@core/enums/chain-id';
import { ValidationErrorCode } from '../../error/error-codes/validation-error-codes';
import { BaseApiError } from '../../error/errors/base-api-error';

import { UnsupportedChainIdMetadata } from '@lib/api/error/dtos/metadata/unsupported-chain-id-metadata.dto';

export class UnsupportedChainIdError extends BaseApiError<UnsupportedChainIdMetadata> {
  constructor(params: { chainId: number | number[] }) {
    const supportedIds = ChainIdUtils.values();
    const providedIds = Array.isArray(params.chainId) ? params.chainId : [params.chainId];

    const unsupportedIds = providedIds.filter((id) => !ChainIdUtils.includes(id));

    const idsToReport = unsupportedIds.length > 0 ? unsupportedIds : providedIds;

    super({
      message: `Unsupported Chain ID: ${idsToReport.join(', ')}`,
      errorCode: ValidationErrorCode.UNSUPPORTED_CHAIN_ID,
      details: `The provided ID is not supported. Supported IDs are: [${supportedIds.join(', ')}].`,
      metadata: {
        chainId: params.chainId,
        unsupportedIds: unsupportedIds,
        supportedIds: supportedIds,
      },
    });
  }
}
