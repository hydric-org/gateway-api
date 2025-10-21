import { HookDTO } from './hook.dto';
import { PoolDTO } from './pool.dto';

export interface V4PoolDTO extends PoolDTO {
  stateViewAddress: string | null;
  poolManagerAddress: string;
  tickSpacing: number;
  latestTick: string;
  permit2Address: string | null;
  latestSqrtPriceX96: string;
  hook: HookDTO | null;
}
