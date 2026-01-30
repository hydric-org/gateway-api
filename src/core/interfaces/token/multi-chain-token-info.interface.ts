import { IMultiChainTokenMetadata } from './multi-chain-token-metadata.interface';

/**
 * Complete information about a multi-chain token including pool metrics.
 * Used for detailed token lookups.
 */
export interface IMultiChainTokenInfo extends IMultiChainTokenMetadata {
  totalValuePooledUsd: number;
}
