import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';

export interface ILiquidityPoolFilter {
  minimumTotalValueLockedUsd: number;
  blockedPoolTypes: LiquidityPoolType[];
  blockedProtocols: string[];
}
