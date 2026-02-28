import { ChainId, ChainIdUtils } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { IBlockchainBasket } from '@core/interfaces/blockchain-basket.interface';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { isSupportedBasketId } from '@lib/api/token/validators/is-supported-basket-id.validator';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

@ApiSchema({
  description: 'Representation of a token basket on selected blockchains',
})
export class BlockchainBasket implements IBlockchainBasket {
  @ApiProperty({
    description: 'The unique slug or ID of the token basket.',
    enum: BasketId,
    example: BasketId.USD_STABLECOINS,
  })
  @isSupportedBasketId()
  readonly basketId!: BasketId;

  @ApiPropertyOptional({
    description: 'The set of blockchains to resolve tokens for. If omitted, all supported networks are the default.',
    enum: ChainId,
    type: [Number],
    example: [ChainId.ETHEREUM, ChainId.BASE],
    default: ChainIdUtils.values(),
  })
  @IsOptional()
  @IsArray()
  @isSupportedChainId({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value.map((v) => Number(v)) : value))
  readonly chainIds?: ChainId[];
}
