import { ChainId } from '@core/enums/chain-id';
import { ISingleChainToken } from './single-chain-token.interface';

export interface IIndexerToken extends ISingleChainToken {
  chainId: ChainId;
  trackedUsdPrice: number;
  trackedTotalValuePooledUsd: number;
}
