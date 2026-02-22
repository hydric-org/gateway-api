import { ParseWrappedToNative } from '@core/enums/parse-wrapped-to-native.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
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

  @ApiPropertyOptional({
    description: `
Controls how Wrapped Native tokens are presented in the response.
- **ALWAYS**: Always convert Wrapped Native tokens to Native tokens in the response.
- **NEVER**: Never convert Wrapped Native tokens; return them as is.
- **AUTO** (Default): Automatically convert to Native if the user searched for Native, otherwise keep as Wrapped.`,
    enum: ParseWrappedToNative,
    default: ParseWrappedToNative.AUTO,
  })
  @IsOptional()
  @IsEnum(ParseWrappedToNative)
  readonly parseWrappedToNative: ParseWrappedToNative = ParseWrappedToNative.AUTO;

  @ApiPropertyOptional({
    description: `
Controls whether a search for a Native token automatically includes its Wrapped version.
- **true** (Default): Searching for a Native token (e.g., ETH) will also query for the Wrapped token (e.g., WETH).
- **false**: Searching for a Native token will only query for the exact Native token address.`,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly useWrappedForNative: boolean = true;
}
