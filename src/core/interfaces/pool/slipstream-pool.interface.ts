import { IPool } from './pool.interface';
import { IV3Pool } from './v3-pool.interface';

export interface ISlipstreamPool extends IPool, IV3Pool {}
