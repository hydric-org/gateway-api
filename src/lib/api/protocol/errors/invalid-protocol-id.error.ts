import { ApiErrorCode } from '@lib/api/error/api-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';
import { ProtocolId } from '@lib/identifiers/protocol-id';

export class InvalidProtocolIdError extends BaseApiError {
  constructor(params: { protocolId: unknown }) {
    const rawValue = params.protocolId;
    const isArray = Array.isArray(rawValue);

    const allValues = isArray ? rawValue : [rawValue];
    const invalidItems = allValues.filter((id) => !ProtocolId.isValid(id));
    const culprits = invalidItems.length > 0 ? invalidItems : allValues;
    const culpritString = culprits.map(String).join(', ');

    super({
      message:
        isArray && culprits.length > 1
          ? `One or more Protocol IDs are invalid: ${culpritString}`
          : `The Protocol ID '${culpritString}' is invalid.`,

      errorCode: ApiErrorCode.INVALID_PROTOCOL_ID,

      details:
        "Protocol IDs must be strictly kebab-case (lowercase, hyphen-separated, no spaces). Example: 'uniswap-v3'",

      metadata: {
        received: rawValue,
        ...(isArray && {
          invalidCount: culprits.length,
          invalidItems: culprits,
        }),
      },
    });
  }
}
