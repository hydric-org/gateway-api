import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsTokenListCursor } from '../validators/is-token-list-cursor.validator';
import { TokenOrder } from './token-order.dto';

export class MultiChainTokenListConfig {
  @ApiPropertyOptional({
    description: `
Toggles the inclusion of multiple assets sharing the exact same ticker symbol.

* **false (Default):** Returns only the single most liquid (highest TVL) instance per chain. This is the "Canonical View" used to filter out secondary deployments.
* **true:** Includes every asset on a chain that matches the symbol string exactly, provided they pass basic price and metadata parity checks.

> ### ⚠️ Security Note
> When set to \`true\`, the probability of encountering **impersonation or scam tokens** increases. While hydric applies secondary heuristics (price,liquidity, etc.), enabling this flag bypasses the primary canonical filter. **Users assume all risks associated with verifying the authenticity of non-canonical contract addresses returned by this configuration.**`,
    default: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  readonly matchAllSymbols: boolean = false;

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
The minimum ratio of **Price Backing Capital** relative to current **TVL**.

Legitimate, market-tested assets typically exhibit a ratio > 1.0, indicating that more capital has been "spent" backing the price than is currently sitting in the pool. A low ratio often signals "Quiet Liquidity" or freshly minted assets with no established market trust.`,
    default: 2.0,
    example: 2.0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly minimumPriceBackingToTvlRatio: number = 2.0;

  @ApiPropertyOptional({
    description: 'The number of items to return in the response.',
    minimum: 1,
    maximum: 500,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  readonly limit: number = 10;

  @ApiPropertyOptional({
    description: 'Ordering configuration. Note: Changing this while using a cursor may yield inconsistent results.',
    type: TokenOrder,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TokenOrder)
  readonly orderBy: TokenOrder = new TokenOrder();

  @ApiPropertyOptional({
    description:
      'Base64-encoded cursor for pagination. Fetch this from the "nextCursor" field of a previous response. Do not pass this if you want to start from the beginning.',
    example: null,
    default: null,
  })
  @IsOptional()
  @IsString()
  @IsTokenListCursor()
  readonly cursor?: string;
}
