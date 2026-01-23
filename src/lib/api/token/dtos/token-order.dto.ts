import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class TokenOrder implements ITokenOrder {
  @ApiPropertyOptional({
    enum: TokenOrderField,
    default: TokenOrderField.TVL,
    description: 'Field that you want to order tokens by.',
    example: TokenOrderField.TVL,
  })
  @IsOptional()
  @IsEnum(TokenOrderField, {
    message: `Invalid order field. Must be one of: ${Object.values(TokenOrderField).join(', ')}`,
  })
  readonly field: TokenOrderField = TokenOrderField.TVL;

  @ApiPropertyOptional({
    enum: OrderDirection,
    default: OrderDirection.DESC,
    description: 'Sorting direction of the selected field.',
    example: OrderDirection.DESC,
  })
  @IsOptional()
  @IsEnum(OrderDirection, {
    message: `Invalid order direction. Must be one of: ${Object.values(OrderDirection).join(', ')}`,
  })
  readonly direction: OrderDirection = OrderDirection.DESC;
}
