import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { isSupportedBasketId } from '../../validators/is-supported-basket-id.validator';

export class GetSingleChainBasketPathParams {
  @ApiProperty({
    description: 'The chain id of the network to get the basket from. This must be a supported network chain id.',
    example: ChainId.MONAD,
    enum: ChainId,
  })
  @isSupportedChainId()
  @Transform(({ value }) => Number(value))
  chainId!: ChainId;

  @ApiProperty({
    description: 'The unique slug of the basket to get.',
    enum: BasketId,
    example: BasketId.USD_STABLECOINS,
  })
  @isSupportedBasketId()
  basketId!: BasketId;
}
