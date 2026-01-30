import { ChainId } from '@core/enums/chain-id';

/**
 * Specialized token interface used as the source for the multichain aggregation algorithm.
 * Contains only the fields necessary for grouping, sorting, and calculating data for multichain tokens.
 */
export interface ILiquidityPoolsIndexerTokenForMultichainAggregation {
  id: string;
  address: string;
  chainId: ChainId;
  name: string;
  symbol: string;
  normalizedName: string;
  normalizedSymbol: string;
  trackedTotalValuePooledUsd: number;
  trackedUsdPrice: number;
}
