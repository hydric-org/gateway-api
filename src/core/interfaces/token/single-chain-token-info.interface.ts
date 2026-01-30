import { ISingleChainTokenMetadata } from './single-chain-token-metadata.interface';

/**
 * Complete information about a token including pool metrics.
 * Used for detailed single token lookups.
 */
export interface ISingleChainTokenInfo extends ISingleChainTokenMetadata {
  totalValuePooledUsd: number;
}
