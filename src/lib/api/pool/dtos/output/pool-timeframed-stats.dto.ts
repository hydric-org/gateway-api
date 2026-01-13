import { IPoolTimeframedStats } from '@core/interfaces/pool-timeframed-stats.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { Round } from '@lib/api/common/transformers/round.transformer';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const PoolStatsExample = {
  swapVolumeUsd: 1_234.56,
  feesUsd: 1_222.22,
  netInflowUsd: -7_291,
  liquidityVolumeUsd: 87_000_000,
  yield: 512.6781609195,
} satisfies PoolStats;

@ApiSchema({
  description: `
**Pool Timeframed Statistics**

Provides high-fidelity performance metrics calculated over a rolling window (e.g., 24h, 7d). 
All monetary values are denominated in USD and rounded to maintain financial consistency.
  `,
})
export class PoolStats implements IPoolTimeframedStats {
  @ApiProperty({
    description:
      'The cumulative swap volume processed by the pool during this specific rolling timeframe, denominated in USD.',
    example: PoolStatsExample.swapVolumeUsd,
  })
  @RoundUsd()
  readonly swapVolumeUsd!: number;

  @ApiProperty({
    description: 'Total revenue generated from swap fees and distributed to liquidity providers within this timeframe.',
    example: PoolStatsExample.feesUsd,
  })
  @RoundUsd()
  readonly feesUsd!: number;

  @ApiProperty({
    description:
      'The net change in liquidity (deposits - withdrawals) during this timeframe. Positive values indicate capital growth; negative values indicate capital flight.',
    example: PoolStatsExample.netInflowUsd,
  })
  @RoundUsd()
  readonly netInflowUsd!: number;

  @ApiProperty({
    description:
      'The gross amount of liquidity activity (sum of all deposits and withdrawals) that occurred during this timeframe.',
    example: PoolStatsExample.liquidityVolumeUsd,
  })
  @RoundUsd()
  readonly liquidityVolumeUsd!: number;

  @ApiProperty({
    description: 'The annualized yield projected based on the performance observed specifically within this timeframe.',
    example: PoolStatsExample.yield,
  })
  @Round(4)
  readonly yield!: number;
}
