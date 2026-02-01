import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class SingleChainTokenSearchFilter implements Omit<ITokenFilter, 'chainIds' | 'symbols'> {
  @ApiPropertyOptional({
    description:
      'The minimum aggregate liquidity in USD for a token to be included in the search. Search uses 0 by default to show most results.',
    default: 0,
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumTotalValuePooledUsd: number = 0;

  @ApiPropertyOptional({
    description:
      'The minimum cumulative swap count for a token to be included in the search. Search uses 0 by default.',
    default: 0,
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly minimumSwapsCount: number = 0;

  @ApiPropertyOptional({
    description:
      'The minimum cumulative Swap Volume (USD) for a token to be included in the search. Search uses 0 by default.',
    default: 0,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumSwapVolumeUsd: number = 0;
}
