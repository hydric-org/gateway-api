import { IV4LiquidityPoolHook } from '../../v4-liquidity-pool-hook.interface';

export interface IV4LiquidityPoolMetadata {
  stateViewAddress: string | null;
  poolManagerAddress: string;
  tickSpacing: number;
  latestTick: string;
  permit2Address: string;
  latestSqrtPriceX96: string;
  hook: IV4LiquidityPoolHook | null;
  positionManagerAddress: string;
}
