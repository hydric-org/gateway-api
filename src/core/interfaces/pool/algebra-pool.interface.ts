import { IAlgebraPoolPlugin } from '../algebra-plugin.interface';
import { IPool } from './pool.interface';
import { IV3Pool } from './v3-pool.interface';

export interface IAlgebraPool extends IPool, IV3Pool {
  deployer: string;
  version: string;
  communityFee: number;
  plugin: IAlgebraPoolPlugin | null;
}
