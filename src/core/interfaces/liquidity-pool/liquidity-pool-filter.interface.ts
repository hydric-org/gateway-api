import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';

export interface ILiquidityPoolFilter {
  chainIds?: ChainId[];
  minimumTotalValueLockedUsd: number;
  blockedPoolTypes: LiquidityPoolType[];
  blockedProtocols: string[];
}
