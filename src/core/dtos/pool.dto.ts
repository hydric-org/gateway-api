import { Networks } from '../enums/networks';
import { PoolTotalStatsDTO } from './pool-total-stats.dto';
import { ProtocolDTO } from './protocol.dto';
import { SingleChainTokenDTO } from './single-chain-token-dto';

export interface PoolDTO {
  poolAddress: string;
  token0: SingleChainTokenDTO;
  token1: SingleChainTokenDTO;
  protocol: ProtocolDTO;
  total24hStats: PoolTotalStatsDTO;
  total7dStats: PoolTotalStatsDTO;
  total30dStats: PoolTotalStatsDTO;
  total90dStats: PoolTotalStatsDTO;
  createdAtTimestamp: number;
  chainId: Networks;
  totalValueLockedUSD: number;
  poolType: string;
  positionManagerAddress: string;
  initialFeeTier: number;
  currentFeeTier: number;
}
