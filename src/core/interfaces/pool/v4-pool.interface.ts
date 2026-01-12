import { IHook } from '../hook.interface';
import { IPool } from './pool.interface';

export interface IV4Pool extends IPool {
  stateViewAddress: string | null;
  poolManagerAddress: string;
  tickSpacing: number;
  latestTick: string;
  permit2Address: string;
  latestSqrtPriceX96: string;
  hook: IHook | null;
}
