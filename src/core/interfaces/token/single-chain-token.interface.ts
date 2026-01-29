import { ChainId } from '../../enums/chain-id';

export interface ISingleChainToken {
  id: string;
  chainId: ChainId;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  logoUrl: string;
  totalValuePooledUsd: number;
}
