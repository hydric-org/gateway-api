import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsSearchLiquidityPoolsCursor } from '../validators/is-search-liquidity-pools-cursor.validator';
import { LiquidityPoolOrder } from './liquidity-pool-order.dto';

export class LiquidityPoolSearchConfig {
  @ApiPropertyOptional({
    description: 'The number of items to return.',
    minimum: 1,
    maximum: 500,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  readonly limit: number = 10;

  @ApiPropertyOptional({
    description: 'Ordering configuration. Note: Changing this while using a cursor may yield inconsistent results.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LiquidityPoolOrder)
  readonly orderBy: LiquidityPoolOrder = new LiquidityPoolOrder();

  @ApiPropertyOptional({
    description:
      'Base64-encoded cursor for pagination. Fetch this from the "nextCursor" field of a previous response. Do not pass this if you want to start from the beginning.',
    example: '',
  })
  @IsOptional()
  @IsString()
  @IsSearchLiquidityPoolsCursor()
  readonly cursor?: string;
}
