import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TokenBasket, TokenBasketExample } from '../token-basket.dto';

export class GetTokenBasketListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'A list of token baskets.',
    type: [TokenBasket],
    example: [TokenBasketExample],
  })
  readonly baskets: TokenBasket[];

  constructor(baskets: TokenBasket[]) {
    super({
      count: baskets.length,
      objectType: TokenBasket,
    });
    this.baskets = baskets;
  }
}
