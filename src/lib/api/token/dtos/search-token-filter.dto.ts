import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';
import { TokenFilter } from './token-filter.dto';

export class SearchTokenFilter extends TokenFilter {
  @ApiPropertyOptional({
    description:
      'The minimum aggregate liquidity in USD for a token to be included in the search. Search uses 0 by default to show most results.',
    default: 0,
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  override readonly minimumTotalValuePooledUsd: number = 0;

  @ApiPropertyOptional({
    description:
      'The minimum Price Backing Capital (USD) for a token to be included in the search. Search uses 0 by default.',
    default: 0,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  override readonly minimumPriceBackingUsd: number = 0;

  @ApiPropertyOptional({
    description:
      'The minimum cumulative swap count for a token to be included in the search. Search uses 0 by default.',
    default: 0,
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  override readonly minimumSwapsCount: number = 0;

  @ApiPropertyOptional({
    description:
      'The minimum cumulative Swap Volume (USD) for a token to be included in the search. Search uses 0 by default.',
    default: 0,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  override readonly minimumSwapVolumeUsd: number = 0;
}
