import { ILiquidityPoolWindowedStats } from '@core/interfaces/liquidity-pool/liquidity-pool-windowed-stats-interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { LiquidityPoolStats, LiquidityPoolStatsExample } from './liquidity-pool-stats.dto';

@ApiSchema({
  description: 'Multi-horizon performance metrics aggregated over the specified period',
})
export class LiquidityPoolWindowedStats implements ILiquidityPoolWindowedStats {
  @ApiProperty({
    description: 'Rolling 24-hour performance metrics',
    type: () => LiquidityPoolStats,
    example: LiquidityPoolStatsExample,
  })
  stats24h!: LiquidityPoolStats;

  @ApiProperty({
    description: 'Rolling 7-day performance metrics',
    type: () => LiquidityPoolStats,
    example: LiquidityPoolStatsExample,
  })
  stats7d!: LiquidityPoolStats;

  @ApiProperty({
    description: 'Rolling 30-day performance metrics',
    type: () => LiquidityPoolStats,
    example: LiquidityPoolStatsExample,
  })
  stats30d!: LiquidityPoolStats;

  @ApiProperty({
    description: 'Rolling 90-day performance metrics',
    type: () => LiquidityPoolStats,
    example: LiquidityPoolStatsExample,
  })
  stats90d!: LiquidityPoolStats;
}
