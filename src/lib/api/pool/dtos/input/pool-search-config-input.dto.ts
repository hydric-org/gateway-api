import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsPoolSearchCursor } from '../../validators/is-search-pools-cursor.validator';
import { PoolOrder } from './pool-order-input.dto';

export class PoolSearchConfig {
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
  @Type(() => PoolOrder)
  readonly orderBy: PoolOrder = new PoolOrder();

  @ApiPropertyOptional({
    description:
      'Base64-encoded cursor for pagination. Fetch this from the "nextCursor" field of a previous response. Do not pass this if you want to start from the beginning.',
    example: 'Y3Vyc29yXzE2NDYwNjQwMDA=',
  })
  @IsOptional()
  @IsString()
  @IsPoolSearchCursor()
  readonly cursor?: string;
}
