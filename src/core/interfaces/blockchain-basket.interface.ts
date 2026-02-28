import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';

export interface IBlockchainBasket {
  basketId: BasketId;
  chainIds?: ChainId[];
}
