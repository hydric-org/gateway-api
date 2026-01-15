import { ILiquidityPoolFeeTier } from '@core/interfaces/liquidity-pool/liquidity-pool-fee-tier.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: 'Information about how much fee a trader will pay to perform swaps in this pool.',
})
export class LiquidityPoolFeeTier implements ILiquidityPoolFeeTier {
  @ApiProperty({
    description: 'The exact percentage of fee a trader pays when using this pool.',
    example: 0.3,
  })
  feeTierPercentage!: number;

  @ApiProperty({
    description:
      'Whether the fee tier is dynamic. A dynamic fee tier means the fee can change according to protocol-defined rules or market conditions.',
    example: false,
  })
  isDynamic!: boolean;
}
