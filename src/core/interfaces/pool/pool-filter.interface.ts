import { PoolType } from '../../enums/pool/pool-type';

export interface IPoolFilter {
  minimumTvlUsd: number;
  blockedPoolTypes: PoolType[];
  blockedProtocols: string[];
}
