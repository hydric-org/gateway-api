import { ILiquidityPoolStats } from './liquidity-pool-stats.interface';

export interface ILiquidityPoolWindowedStats {
  stats24h: ILiquidityPoolStats;
  stats7d: ILiquidityPoolStats;
  stats30d: ILiquidityPoolStats;
  stats90d: ILiquidityPoolStats;
}
