import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsTokenListCursor } from '../validators/is-token-list-cursor.validator';
import { TokenOrder } from './token-order.dto';

export class MultiChainTokenListConfig {
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
