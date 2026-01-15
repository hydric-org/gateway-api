import { ChainId } from '@core/enums/chain-id';

export interface IBlockchainAddress {
  chainId: ChainId;
  address: string;
}
