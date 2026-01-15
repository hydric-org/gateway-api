import { Network } from '@core/enums/network';

export interface IBlockchainAddress {
  chainId: Network;
  address: string;
}
