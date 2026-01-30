import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';

export interface ILiquidityPoolTokenBalance {
  amount: number;
  amountUsd: number;
  token: ISingleChainTokenMetadata;
}
