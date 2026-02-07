import { ApiKeyDisabledMetadata } from '../dtos/metadata/api-key-disabled-metadata.dto';
import { ApiKeyExpiredMetadata } from '../dtos/metadata/api-key-expired-metadata.dto';
import { ApiKeyInvalidMetadata } from '../dtos/metadata/api-key-invalid-metadata.dto';
import { ApiKeyMissingMetadata } from '../dtos/metadata/api-key-missing-metadata.dto';
import { ApiKeyNotFoundMetadata } from '../dtos/metadata/api-key-not-found-metadata.dto';
import { ApiKeyUnknownMetadata } from '../dtos/metadata/api-key-unknown-metadata.dto';
import { InvalidBasketIdMetadata } from '../dtos/metadata/invalid-basket-id-metadata.dto';
import { InvalidBlockchainAddressMetadata } from '../dtos/metadata/invalid-blockchain-address-metadata.dto';
import { InvalidLiquidityPoolAddressMetadata } from '../dtos/metadata/invalid-liquidity-pool-address-metadata.dto';
import { InvalidPaginationCursorMetadata } from '../dtos/metadata/invalid-pagination-cursor-metadata.dto';
import { InvalidProtocolIdMetadata } from '../dtos/metadata/invalid-protocol-id-metadata.dto';
import { LiquidityPoolNotFoundMetadata } from '../dtos/metadata/liquidity-pool-not-found-metadata.dto';
import { RateLimitMetadata } from '../dtos/metadata/rate-limit-metadata.dto';
import { RouteNotFoundMetadata } from '../dtos/metadata/route-not-found-metadata.dto';
import { TokenBasketNotFoundMetadata } from '../dtos/metadata/token-basket-not-found-metadata.dto';
import { TokenNotFoundMetadata } from '../dtos/metadata/token-not-found-metadata.dto';
import { UnknownErrorMetadata } from '../dtos/metadata/unknown-error-metadata.dto';
import { UnsupportedChainIdMetadata } from '../dtos/metadata/unsupported-chain-id-metadata.dto';
import { ValidationErrorMetadata } from '../dtos/metadata/validation-error-metadata.dto';

export const ErrorMetadataClasses = [
  ApiKeyMissingMetadata,
  ApiKeyDisabledMetadata,
  ApiKeyExpiredMetadata,
  ApiKeyInvalidMetadata,
  ApiKeyNotFoundMetadata,
  ApiKeyUnknownMetadata,
  RateLimitMetadata,
  InvalidBlockchainAddressMetadata,
  InvalidPaginationCursorMetadata,
  UnsupportedChainIdMetadata,
  InvalidProtocolIdMetadata,
  InvalidBasketIdMetadata,
  InvalidLiquidityPoolAddressMetadata,
  ValidationErrorMetadata,
  LiquidityPoolNotFoundMetadata,
  TokenNotFoundMetadata,
  TokenBasketNotFoundMetadata,
  RouteNotFoundMetadata,
  UnknownErrorMetadata,
];

export type ErrorMetadata =
  | ApiKeyMissingMetadata
  | ApiKeyDisabledMetadata
  | ApiKeyExpiredMetadata
  | ApiKeyInvalidMetadata
  | ApiKeyNotFoundMetadata
  | ApiKeyUnknownMetadata
  | RateLimitMetadata
  | InvalidBlockchainAddressMetadata
  | InvalidPaginationCursorMetadata
  | UnsupportedChainIdMetadata
  | InvalidProtocolIdMetadata
  | InvalidBasketIdMetadata
  | InvalidLiquidityPoolAddressMetadata
  | ValidationErrorMetadata
  | LiquidityPoolNotFoundMetadata
  | TokenNotFoundMetadata
  | TokenBasketNotFoundMetadata
  | RouteNotFoundMetadata
  | UnknownErrorMetadata;
