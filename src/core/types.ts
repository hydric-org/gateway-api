import { IAlgebraPool } from './interfaces/pool/algebra-pool.interface';
import { IPool } from './interfaces/pool/pool.interface';
import { IV3Pool } from './interfaces/pool/v3-pool.interface';
import { IV4Pool } from './interfaces/pool/v4-pool.interface';

export type LiquidityPool = (IV3Pool & IPool) | (IV4Pool & IPool) | (IAlgebraPool & IPool);
