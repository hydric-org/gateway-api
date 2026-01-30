import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { LiquidityPoolMetadata } from '@core/types/liquidity-pool-metadata';
import { ChainId } from '../../enums/chain-id';
import { IProtocol } from '../protocol.interface';
import { ISingleChainTokenMetadata } from '../token/single-chain-token-metadata.interface';
import { ILiquidityPoolBalance } from './balance/liquidity-pool-balance.interface';
import { ILiquidityPoolFeeTier } from './liquidity-pool-fee-tier.interface';
import { ILiquidityPoolWindowedStats } from './liquidity-pool-windowed-stats-interface';

export interface ILiquidityPool {
  address: string;
  tokens: ISingleChainTokenMetadata[];
  protocol: IProtocol;
  createdAtTimestamp: number;
  chainId: ChainId;
  balance: ILiquidityPoolBalance;
  type: LiquidityPoolType;
  feeTier: ILiquidityPoolFeeTier;
  stats: ILiquidityPoolWindowedStats;
  metadata: LiquidityPoolMetadata;
}
