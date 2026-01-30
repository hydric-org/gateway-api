import { ISingleChainTokenMetadata } from './single-chain-token-metadata.interface';
import { ITokenBasketConfiguration } from './token-basket-configuration.interface';

export interface ITokenBasket extends ITokenBasketConfiguration {
  tokens: ISingleChainTokenMetadata[];
}
