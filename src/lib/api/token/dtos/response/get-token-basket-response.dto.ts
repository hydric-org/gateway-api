import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TokenBasket, TokenBasketExample } from '../token-basket.dto';

export class GetTokenBasketResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'The requested token basket.',
    type: TokenBasket,
    example: TokenBasketExample,
  })
  readonly basket: TokenBasket;

  constructor(basket: TokenBasket) {
    super({
      count: 1,
      objectType: TokenBasket,
    });
    this.basket = basket;
  }
}
