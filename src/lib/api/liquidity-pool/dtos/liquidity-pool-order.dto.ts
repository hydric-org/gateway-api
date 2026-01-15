import { LiquidityPoolOrderField } from '@core/enums/liquidity-pool/liquidity-pool-order-field';
import { LiquidityPoolStatsTimeframe } from '@core/enums/liquidity-pool/liquidity-pool-stats-timeframe';
import { ILiquidityPoolOrder } from '@core/interfaces/liquidity-pool/liquidity-pool-order.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderDirection } from 'src/core/enums/order-direction';

export class LiquidityPoolOrder implements ILiquidityPoolOrder {
  @ApiPropertyOptional({
    enum: LiquidityPoolOrderField,
    default: LiquidityPoolOrderField.TVL,
    description: 'Field that you want to order pools by.',
    example: LiquidityPoolOrderField.TVL,
  })
  @IsOptional()
  @IsEnum(LiquidityPoolOrderField, {
    message: `Invalid order field. Must be one of: ${Object.values(LiquidityPoolOrderField).join(', ')}`,
  })
  readonly field: LiquidityPoolOrderField = LiquidityPoolOrderField.TVL;

  @ApiPropertyOptional({
    enum: OrderDirection,
    default: OrderDirection.DESC,
    description: 'Sorting direction of the selected field.',
    example: OrderDirection.DESC,
  })
  @IsOptional()
  @IsEnum(OrderDirection, {
    message: `Invalid order direction. Must be one of: ${Object.values(OrderDirection).join(', ')}`,
  })
  readonly direction: OrderDirection = OrderDirection.DESC;

  @ApiPropertyOptional({
    enum: LiquidityPoolStatsTimeframe,
    default: LiquidityPoolStatsTimeframe.DAY,
    description:
      'Timeframe used when ordering by a stats-based field. Does not apply when ordering by total fields, like TVL.',
  })
  @IsOptional()
  @IsEnum(LiquidityPoolStatsTimeframe, {
    message: `Invalid timeframe. Must be one of: ${Object.values(LiquidityPoolStatsTimeframe).join(', ')}`,
  })
  readonly timeframe: LiquidityPoolStatsTimeframe = LiquidityPoolStatsTimeframe.DAY;
}
