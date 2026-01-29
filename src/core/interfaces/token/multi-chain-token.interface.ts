import { ChainId } from '@core/enums/chain-id';
import { ISingleChainToken } from './single-chain-token.interface';

export interface IMultiChainToken {
  tokenIds: string[];
  symbol: string;
  name: string;
  logoUrl: string;
  totalValuePooledUsd: number;
  chainIds: ChainId[];
  tokens: ISingleChainToken[];
}
