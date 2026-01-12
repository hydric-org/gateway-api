import { PoolType } from '@core/enums/pool/pool-type';
import { Network } from '../../enums/network';
import { IPoolTimeframedStats } from '../pool-timeframed-stats.interface';
import { IProtocol } from '../protocol.interface';
import { ISingleChainToken } from '../token/single-chain-token.interface';

export interface IPool {
  poolAddress: string;
  token0: ISingleChainToken;
  token1: ISingleChainToken;
  protocol: IProtocol;
  createdAtTimestamp: number;
  chainId: Network;
  totalValueLockedUsd: number;
  poolType: PoolType;
  positionManagerAddress: string;
  initialFeeTier: number;
  currentFeeTier: number;
  isDynamicFee: boolean;
  total24hStats: IPoolTimeframedStats;
  total7dStats: IPoolTimeframedStats;
  total30dStats: IPoolTimeframedStats;
  total90dStats: IPoolTimeframedStats;
}
