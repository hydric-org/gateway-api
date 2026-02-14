import { ChainId } from '@core/enums/chain-id';
import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class MultiChainTokenSearchFilter implements ITokenFilter {
  @ApiPropertyOptional({
    description: 'Filter results to specific networks by chain ID. If omitted, defaults to all supported networks.',
    example: [ChainId.ETHEREUM, ChainId.BASE],
    enum: ChainId,
    isArray: true,
    uniqueItems: true,
  })
  @IsOptional()
  @IsArray()
  @isSupportedChainId({ each: true })
  readonly chainIds?: ChainId[];

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

  @ApiPropertyOptional({
    description: `
If set to **true**, the response will exclude Wrapped Native tokens (e.g., WETH on Ethereum).
Defaults to **false** for search operations to ensure users can find WETH if they search for it.`,
    default: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  readonly ignoreWrappedNative: boolean = false;
}
