import { ISlipstreamLiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/slipstream-liquidity-pool-metadata.interface';
import { ApiSchema } from '@nestjs/swagger';
import { V3LiquidityPoolMetadata, V3LiquidityPoolMetadataExample } from './v3-liquidity-pool-metadata.dto';

export const SlipstreamLiquidityPoolMetadataExample: ISlipstreamLiquidityPoolMetadata = {
  ...V3LiquidityPoolMetadataExample,
};

@ApiSchema({
  description: 'Technical state and architectural configuration for Slipstream pools',
})
export class SlipstreamLiquidityPoolMetadata
  extends V3LiquidityPoolMetadata
  implements ISlipstreamLiquidityPoolMetadata {}
