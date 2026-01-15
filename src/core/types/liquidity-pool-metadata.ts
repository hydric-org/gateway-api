import { IAlgebraLiquidityPoolMetadata } from '../interfaces/liquidity-pool/metadata/algebra-liquidity-pool-metadata.interface';
import { ISlipstreamLiquidityPoolMetadata } from '../interfaces/liquidity-pool/metadata/slipstream-liquidity-pool-metadata.interface';
import { IV3LiquidityPoolMetadata } from '../interfaces/liquidity-pool/metadata/v3-liquidity-pool-metadata.interface';
import { IV4LiquidityPoolMetadata } from '../interfaces/liquidity-pool/metadata/v4-liquidity-pool-metadata.interface';

export type LiquidityPoolMetadata =
  | IV3LiquidityPoolMetadata
  | IV4LiquidityPoolMetadata
  | IAlgebraLiquidityPoolMetadata
  | ISlipstreamLiquidityPoolMetadata;
