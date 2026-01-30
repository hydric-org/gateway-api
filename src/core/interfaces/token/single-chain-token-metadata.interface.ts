import { ChainId } from '../../enums/chain-id';

/**
 * Lightweight metadata for a token on a single blockchain.
 * Used for lists, search results, baskets, and liquidity pool references.
 */
export interface ISingleChainTokenMetadata {
  chainId: ChainId;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  logoUrl: string;
}
