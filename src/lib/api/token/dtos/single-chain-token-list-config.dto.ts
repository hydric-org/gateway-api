import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsSingleChainTokenListCursor } from '../validators/is-single-chain-token-list-cursor.validator';
import { TokenOrder } from './token-order.dto';

export class SingleChainTokenListConfig {
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
    description: 'Ordering configuration for the token list.',
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
  @IsSingleChainTokenListCursor()
  readonly cursor?: string;
}
