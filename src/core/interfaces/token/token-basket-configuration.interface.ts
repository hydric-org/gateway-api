import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { IBlockchainAddress } from '../blockchain-address.interface';

export interface ITokenBasketConfiguration {
  id: BasketId;
  name: string;
  description: string;
  logoUrl: string;
  chainIds: ChainId[];
  addresses: IBlockchainAddress[];
}
