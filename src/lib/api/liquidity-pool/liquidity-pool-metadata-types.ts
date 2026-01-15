import { AlgebraLiquidityPoolMetadata } from './dtos/metadata/algebra-liquidity-pool-metadata.dto';
import { SlipstreamLiquidityPoolMetadata } from './dtos/metadata/slipstream-liquidity-pool-metadata.dto';
import { V3LiquidityPoolMetadata } from './dtos/metadata/v3-liquidity-pool-metadata.dto';
import { V4LiquidityPoolMetadata } from './dtos/metadata/v4-liquidity-pool-metadata.dto';

export const LIQUIDITY_POOL_METADATA_TYPES = [
  V3LiquidityPoolMetadata,
  V4LiquidityPoolMetadata,
  AlgebraLiquidityPoolMetadata,
  SlipstreamLiquidityPoolMetadata,
];
