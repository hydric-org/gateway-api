import { ChainId } from '../../enums/chain-id';

export interface ISingleChainToken {
  chainId: ChainId;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
}
