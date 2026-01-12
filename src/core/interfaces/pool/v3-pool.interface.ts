import { IPool } from './pool.interface';

export interface IV3Pool extends IPool {
  tickSpacing: number;
  latestTick: string;
  latestSqrtPriceX96: string;
}
