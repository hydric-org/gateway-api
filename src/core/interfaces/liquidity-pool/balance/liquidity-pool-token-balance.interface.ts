import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';

export interface ILiquidityPoolTokenBalance {
  amount: number;
  amountUsd: number;
  token: ISingleChainToken;
}
