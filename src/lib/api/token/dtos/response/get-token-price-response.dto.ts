import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: 'Response object containing the current price of the requested token.',
})
@ObjectCost(1)
export class GetTokenPriceResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'The current price of the token.',
    example: 2543.21,
    type: Number,
  })
  readonly price: number;

  constructor(price: number) {
    super({
      count: 1,
      objectType: GetTokenPriceResponse,
    });
    this.price = price;
  }
}
