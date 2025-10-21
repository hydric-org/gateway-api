import { V3PoolDTO } from './dtos/v3-pool.dto';
import { V4PoolDTO } from './dtos/v4-pool.dto';

// each variant gets the other's fields as optional
export type LiquidityPool = (V3PoolDTO & Partial<V4PoolDTO>) | (V4PoolDTO & Partial<V3PoolDTO>);
