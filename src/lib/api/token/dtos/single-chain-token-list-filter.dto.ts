import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class SingleChainTokenListFilter implements Omit<ITokenFilter, 'chainIds'> {
  @ApiPropertyOptional({
    description: `
The minimum aggregate liquidity in USD for a token to be included in the response. 
This filters out low-liquidity assets across the indexed ecosystem.`,
    example: 50000,
    default: 10000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumTotalValuePooledUsd: number = 10000;

  @ApiPropertyOptional({
    description: `
The minimum **Price Backing Capital** (USD) required for an asset to be included in the response.
This metric measures the depth of validation based on counterparty liquidity: every time a swap changes the price, it adds the whole TVL of the other side as a 'validation' of the new price.`,
    default: 100000,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumPriceBackingUsd: number = 100000;

  @ApiPropertyOptional({
    description: `The minimum cumulative swap count required for an asset to be included in the response.`,
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
The minimum cumulative **Swap Volume** (USD) since the asset was deployed, required for an asset to appear.`,
    default: 100000,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumSwapVolumeUsd: number = 100000;
}
