import { ILiquidityPoolTokenBalance } from './liquidity-pool-token-balance.interface';

export interface ILiquidityPoolBalance {
  totalValueLockedUsd: number;
  tokens: ILiquidityPoolTokenBalance[];
}
