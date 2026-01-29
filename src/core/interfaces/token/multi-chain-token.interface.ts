import { ChainId } from '@core/enums/chain-id';
import { IBlockchainAddress } from '../blockchain-address.interface';

export interface IMultiChainToken {
  addresses: IBlockchainAddress[];
  chainIds: ChainId[];
  symbol: string;
  name: string;
  logoUrl: string;
  totalValuePooledUsd: number;
}
