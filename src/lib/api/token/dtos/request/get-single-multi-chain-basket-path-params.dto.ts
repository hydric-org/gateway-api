import { BasketId } from '@core/enums/token/basket-id.enum';
import { ApiProperty } from '@nestjs/swagger';
import { isSupportedBasketId } from '../../validators/is-supported-basket-id.validator';

export class GetSingleMultiChainBasketPathParams {
  @ApiProperty({
    description: 'The unique slug of the basket.',
    enum: BasketId,
    example: BasketId.USD_STABLECOINS,
  })
  @isSupportedBasketId()
  basketId!: BasketId;
}
