import { IAlgebraLiquidityPoolPlugin } from '../../algebra-liquidity-pool-plugin.interface';
import { IV3LiquidityPoolMetadata } from './v3-liquidity-pool-metadata.interface';

export interface IAlgebraLiquidityPoolMetadata extends IV3LiquidityPoolMetadata {
  deployer: string;
  version: string;
  communityFeePercent: number;
  plugin: IAlgebraLiquidityPoolPlugin | null;
}
