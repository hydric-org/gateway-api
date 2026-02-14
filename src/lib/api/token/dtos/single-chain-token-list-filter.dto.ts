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

  @ApiPropertyOptional({
    description: `
If set to **true** (default), the response will exclude Wrapped Native tokens (e.g., WETH on Ethereum, WMATIC on Polygon).
Use **false** if you specifically need the ERC-20 wrapped version of the native asset. But note that both the native token and its wrapped version will appear in the results`,
    default: true,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  readonly ignoreWrappedNative: boolean = true;
}
