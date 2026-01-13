import { BaseError } from '@core/errors/base-core-error';
import { InvalidPaginationCursorError } from '../error/errors/invalid-pagination-cursor.error';
import { UnsupportedChainIdError } from '../network/errors/unsupported-chain-id.error';
import { InvalidPoolAddressError } from '../pool/errors/invalid-pool-address.error';
import { InvalidProtocolIdError } from '../protocol/errors/invalid-protocol-id.error';
import { InvalidTokenIdError } from '../token/errors/invalid-token-id.error';

export enum ValidatorKey {
  IS_SUPPORTED_CHAIN_ID = 'isSupportedChainId',
  IS_POOL_ADDRESS = 'isPoolAddress',
  IS_SEARCH_POOLS_CURSOR = 'isSearchPoolsCursor',
  IS_VALID_TOKEN_ID = 'isValidTokenId',
  IS_PROTOCOL_ID = 'isProtocolId',
}

export class ValidatorKeyUtils {
  static isValidatorKey(key: string): boolean {
    return (
      Object.prototype.hasOwnProperty.call(ValidatorKey, key) ||
      Object.values(ValidatorKey).includes(key as ValidatorKey)
    );
  }

  static validationError(value: any, key: ValidatorKey): BaseError {
    switch (key) {
      case ValidatorKey.IS_SUPPORTED_CHAIN_ID:
        return new UnsupportedChainIdError({ chainId: value });
      case ValidatorKey.IS_POOL_ADDRESS:
        return new InvalidPoolAddressError({ poolAddress: value });
      case ValidatorKey.IS_SEARCH_POOLS_CURSOR:
        return new InvalidPaginationCursorError({ cursor: value });
      case ValidatorKey.IS_VALID_TOKEN_ID:
        return new InvalidTokenIdError({ tokenId: value });
      case ValidatorKey.IS_PROTOCOL_ID:
        return new InvalidProtocolIdError({ protocolId: value });
    }
  }
}
