import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { ITokenBasket } from '@core/interfaces/token/token-basket.interface';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { BlockchainAddress } from '../../address/blockchain-address.dto';
import { SingleChainTokenMetadata, SingleChainTokenMetadataExample } from './single-chain-token-metadata.dto';

export const TokenBasketExample: ITokenBasket = {
  id: BasketId.USD_STABLECOINS,
  name: 'USD Stablecoins',
  description: 'A basket of the most liquid USD stablecoins in the ecosystem.',
  logoUrl: 'https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/assets/logos/usd-stablecoins.png',
  chainIds: [ChainId.ETHEREUM, ChainId.MONAD],
  addresses: [
    { chainId: ChainId.ETHEREUM, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    { chainId: ChainId.MONAD, address: '0x1234...' },
  ],
  tokens: [SingleChainTokenMetadataExample],
};

@ApiSchema({
  description: 'Multiple tokens grouped together to represent a basket of assets for a specific primitive or theme.',
})
@ObjectCost(15)
export class TokenBasket implements ITokenBasket {
  @ApiProperty({
    description: 'The unique identifier of the token basket.',
    example: TokenBasketExample.id,
    enum: BasketId,
  })
  readonly id!: BasketId;

  @ApiProperty({
    description: 'The human-readable name of the basket.',
    example: TokenBasketExample.name,
  })
  readonly name!: string;

  @ApiProperty({
    description: 'A detailed description of what the basket represents.',
    example: TokenBasketExample.description,
  })
  readonly description!: string;

  @ApiProperty({
    description: 'The URL of the basket logo.',
    example: TokenBasketExample.logoUrl,
  })
  readonly logoUrl!: string;

  @ApiProperty({
    description: 'List of chain IDs where this basket is available.',
    example: TokenBasketExample.chainIds,
    type: [Number],
  })
  readonly chainIds!: ChainId[];

  @ApiProperty({
    description: 'List of underlying token addresses across supported chains.',
    type: [BlockchainAddress],
    example: TokenBasketExample.addresses,
  })
  readonly addresses!: BlockchainAddress[];

  @ApiProperty({
    description: 'Token metadata for the assets in this basket.',
    type: [SingleChainTokenMetadata],
    example: TokenBasketExample.tokens,
  })
  readonly tokens!: SingleChainTokenMetadata[];
}
