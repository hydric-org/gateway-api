import { ChainId } from '@core/enums/chain-id';

export interface IMultiChainToken {
  ids: string[];
  addresses: string[];
  chainIds: ChainId[];
  decimals: Record<string, number>;
  symbol: string;
  name: string;
  logoUrl: string;
  totalValuePooledUsd: number;
}
