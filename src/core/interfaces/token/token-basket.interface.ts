import { ISingleChainToken } from './single-chain-token.interface';
import { ITokenBasketConfiguration } from './token-basket-configuration.interface';

export interface ITokenBasket extends ITokenBasketConfiguration {
  tokens: ISingleChainToken[];
}
