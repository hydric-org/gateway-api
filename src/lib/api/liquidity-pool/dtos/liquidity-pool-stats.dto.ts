import { ILiquidityPoolStats } from '@core/interfaces/liquidity-pool/liquidity-pool-stats.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { Round } from '@lib/api/common/transformers/round.transformer';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const LiquidityPoolStatsExample = {
  swapVolumeUsd: 1_234.56,
  feesUsd: 1_222.22,
  netInflowUsd: -7_291,
  liquidityVolumeUsd: 87_000_000,
  yield: 512.6781609195,
} satisfies LiquidityPoolStats;

@ApiSchema({
  description: 'Relevant stats about a liquidity pool. Such as Swap Fees, Swap Volume, Yield, net inflow, etc...',
})
export class LiquidityPoolStats implements ILiquidityPoolStats {
  @ApiProperty({
    description: 'The cumulative swap volume processed by the pool',
    example: LiquidityPoolStatsExample.swapVolumeUsd,
  })
  @RoundUsd()
  readonly swapVolumeUsd!: number;

  @ApiProperty({
    description: 'Total revenue generated from swap fees and distributed to liquidity providers.',
    example: LiquidityPoolStatsExample.feesUsd,
  })
  @RoundUsd()
  readonly feesUsd!: number;

  @ApiProperty({
    description:
      'The net change in liquidity (deposits - withdrawals). Positive values indicate capital growth; negative values indicate capital flight.',
    example: LiquidityPoolStatsExample.netInflowUsd,
  })
  @RoundUsd()
  readonly netInflowUsd!: number;

  @ApiProperty({
    description: 'The gross amount of liquidity activity (sum of all deposits and withdrawals).',
    example: LiquidityPoolStatsExample.liquidityVolumeUsd,
  })
  @RoundUsd()
  readonly liquidityVolumeUsd!: number;

  @ApiProperty({
    description: 'The annualized yield projected based on the performance observed.',
    example: LiquidityPoolStatsExample.yield,
  })
  @Round(4)
  readonly yield!: number;
}
