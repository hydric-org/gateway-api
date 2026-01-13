import { IPoolOrder } from '@core/interfaces/pool/pool-order.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderDirection } from 'src/core/enums/order-direction';
import { PoolOrderField } from 'src/core/enums/pool/pool-order-field';
import { PoolStatsTimeframe } from 'src/core/enums/pool/pool-stats-timeframe';

export class PoolOrder implements IPoolOrder {
  @ApiPropertyOptional({
    enum: PoolOrderField,
    default: PoolOrderField.TVL,
    description: 'Field that you want to order pools by.',
    example: PoolOrderField.TVL,
  })
  @IsOptional()
  @IsEnum(PoolOrderField, {
    message: `Invalid order field. Must be one of: ${Object.values(PoolOrderField).join(', ')}`,
  })
  readonly field: PoolOrderField = PoolOrderField.TVL;

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
    enum: PoolStatsTimeframe,
    default: PoolStatsTimeframe.DAY,
    description:
      'Timeframe used when ordering by a stats-based field. Does not apply when ordering by total fields, like TVL.',
  })
  @IsOptional()
  @IsEnum(PoolStatsTimeframe, {
    message: `Invalid timeframe. Must be one of: ${Object.values(PoolStatsTimeframe).join(', ')}`,
  })
  readonly timeframe: PoolStatsTimeframe = PoolStatsTimeframe.DAY;
}
