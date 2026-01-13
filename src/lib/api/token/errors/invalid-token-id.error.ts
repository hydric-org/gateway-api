import { NetworkUtils } from '@core/enums/network';
import { TokenId } from '@lib/identifiers/token-id';
import { BaseApiError } from '../../error/errors/base-api-error';
import { ValidationErrorCode } from '../../error/validation-error-codes';

export class InvalidTokenIdError extends BaseApiError {
  constructor(params: { tokenId: unknown }) {
    const rawValue = params.tokenId;
    const isArray = Array.isArray(rawValue);

    const allValues = isArray ? rawValue : [rawValue];
    const invalidItems = allValues.filter((id) => !TokenId.isValid(id));
    const culprits = invalidItems.length > 0 ? invalidItems : allValues;
    const mainCulprit = String(culprits[0] || '');

    super({
      message:
        isArray && culprits.length > 1
          ? `One or more Token IDs are invalid (${culprits.length} found)`
          : `Invalid Token ID: ${mainCulprit}`,

      errorCode: ValidationErrorCode.INVALID_TOKEN_ID,

      details: `Token IDs must follow the format '<chainId>-<address>'. Supported chain IDs: [${NetworkUtils.values().join(', ')}].`,

      meta: {
        invalidTokenIds: isArray ? culprits : mainCulprit,
        receivedCount: allValues.length,
        ...(isArray && { totalInvalid: culprits.length }),
      },
    });
  }
}
