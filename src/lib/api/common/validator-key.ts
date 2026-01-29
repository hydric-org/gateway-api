import { BaseError } from '@core/errors/base-core-error';
import { InvalidBlockchainAddressError } from '../address/errors/invalid-blockchain-address.error';
import { InvalidPaginationCursorError } from '../error/errors/invalid-pagination-cursor.error';
import { InvalidLiquidityPoolAddressError } from '../liquidity-pool/errors/invalid-liquidity-pool-address.error';
import { UnsupportedChainIdError } from '../network/errors/unsupported-chain-id.error';
import { InvalidProtocolIdError } from '../protocol/errors/invalid-protocol-id.error';
import { InvalidBasketIdError } from '../token/errors/invalid-basket-id.error';

export enum ValidatorKey {
  IS_SUPPORTED_CHAIN_ID = 'isSupportedChainId',
  IS_POOL_ADDRESS = 'isPoolAddress',
  IS_SEARCH_LIQUIDITY_POOLS_CURSOR = 'isPoolSearchCursor',
  IS_VALID_ADDRESS = 'isValidAddress',
  IS_PROTOCOL_ID = 'isProtocolId',
  IS_TOKEN_LIST_CURSOR = 'isTokenListCursor',
  IS_SINGLE_CHAIN_TOKEN_LIST_CURSOR = 'isSingleChainTokenListCursor',
  IS_SUPPORTED_BASKET_ID = 'isSupportedBasketId',
}

export class ValidatorKeyUtils {
  static isValidatorKey(key: string): boolean {
    return (
      Object.prototype.hasOwnProperty.call(ValidatorKey, key) ||
      Object.values(ValidatorKey).includes(key as ValidatorKey)
    );
  }

  static validationError(value: any, key: ValidatorKey, property: string): BaseError {
    switch (key) {
      case ValidatorKey.IS_SUPPORTED_CHAIN_ID:
        return new UnsupportedChainIdError({ chainId: value });
      case ValidatorKey.IS_POOL_ADDRESS:
        return new InvalidLiquidityPoolAddressError({ liquidityPoolAddress: value });
      case ValidatorKey.IS_SEARCH_LIQUIDITY_POOLS_CURSOR:
        return new InvalidPaginationCursorError({ cursor: value });
      case ValidatorKey.IS_VALID_ADDRESS:
        return new InvalidBlockchainAddressError({ blockchainAddress: value, property });
      case ValidatorKey.IS_PROTOCOL_ID:
        return new InvalidProtocolIdError({ protocolId: value });
      case ValidatorKey.IS_TOKEN_LIST_CURSOR:
        return new InvalidPaginationCursorError({ cursor: value });
      case ValidatorKey.IS_SINGLE_CHAIN_TOKEN_LIST_CURSOR:
        return new InvalidPaginationCursorError({ cursor: value });
      case ValidatorKey.IS_SUPPORTED_BASKET_ID:
        return new InvalidBasketIdError({ basketId: value });
    }
  }
}
