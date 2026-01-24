import { ChainId } from '@core/enums/chain-id';
import { ISingleChainToken } from './single-chain-token.interface';

export interface IIndexerToken extends ISingleChainToken {
  id: string;
  chainId: ChainId;
  trackedUsdPrice: number;
  trackedTotalValuePooledUsd: number;
  trackedPriceBackingUsd: number;
  trackedSwapVolumeUsd: number;
  swapsCount: number;
  normalizedSymbol: string;
  normalizedName: string;
}
