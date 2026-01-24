import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class TokenFilter implements ITokenFilter {
  @ApiPropertyOptional({
    description: `
Filter assets by a single ticker symbol or a collection of symbols. 

**Note:** This filter is **case-sensitive** to distinguish between distinct assets with similar ticker names (e.g., 'mUSD' vs 'MUSD'). hydric will only return assets that match the exact casing provided.`,
    example: [],
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
    default: 50000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumTotalValuePooledUsd: number = 50000;

  @ApiPropertyOptional({
    description: `
The minimum **Price Backing Capital** (USD) required for an asset to attain 'Canonical' status.

Unlike simple volume, this metric aggregates the **Counterparty TVL** involved in every price-impacting trade. 

**How it works:** Every time an asset's price changes, hydric credits the USD value of the *other* asset in the pool to this total. This effectively measures the "Depth of Validation"; scammers can wash-trade volume easily, but they cannot "fake" the massive counterparty liquidity required to build high Price Backing without genuine financial exposure.`,
    default: 100000,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly minimumPriceBackingUsd: number = 100000;

  @ApiPropertyOptional({
    description: `
The minimum cumulative swap count required for asset validation. 

This ensures the asset has a demonstrated history of organic market participation and counterparty interaction before being promoted to the Unified Model.`,
    default: 1000,
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly minimumSwapsCount: number = 1000;

  @ApiPropertyOptional({
    description: `
The minimum **Swap Volume** (USD) required for an asset to appear in the list.

This filters for assets that have sustained legitimate economic activity. While volume can be wash-traded, high volume combined with high swap counts and price backing is a strong signal of legitimacy.`,
    default: 100000,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly minimumSwapVolumeUsd: number = 100000;
}
