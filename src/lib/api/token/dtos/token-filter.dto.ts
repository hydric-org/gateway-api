import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class TokenFilter implements ITokenFilter {
  @ApiPropertyOptional({
    description: `
Filter assets by a single ticker symbol or a collection of symbols. 

**Note:** This filter is **case-sensitive** to distinguish between distinct assets with similar ticker names (e.g., 'mUSD' vs 'MUSD'). hydric will only return assets that match the exact casing provided.`,
    example: ['USDC', 'WETH'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  readonly symbols?: string[];

  @ApiPropertyOptional({
    description: `
The minimum aggregate liquidity across all liquidity pools in USD for a token to be included in the response. 
This filters out low-liquidity or "dust" assets across the indexed ecosystems.`,
    example: 50000,
    default: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumTotalValuePooledUsd: number = 1000;
}
