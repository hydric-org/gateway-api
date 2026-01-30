import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { IMultiChainTokenMetadata } from '@core/interfaces/token/multi-chain-token-metadata.interface';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const MultiChainTokenMetadataExample: IMultiChainTokenMetadata = {
  addresses: [
    { chainId: ChainId.ETHEREUM, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
    { chainId: ChainId.BASE, address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' },
  ],
  chainIds: [ChainId.ETHEREUM, ChainId.BASE],
  symbol: 'USDC',
  name: 'USD Coin',
  logoUrl: TOKEN_LOGO(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
};

@ApiSchema({
  description: `Simple metadata for a single token across multiple blockchain ecosystems. This aggregates fragmented chain-specific metadata into a unified model to simplify cross-chain interactions.`,
})
@ObjectCost(15)
export class MultiChainTokenMetadata implements IMultiChainTokenMetadata {
  @ApiProperty({
    description: 'The collection of underlying contract addresses for this token across multiple chains.',
    type: [BlockchainAddress],
  })
  addresses!: BlockchainAddress[];

  @ApiProperty({
    description: `The representative token symbol across all chains`,
    example: MultiChainTokenMetadataExample.symbol,
  })
  symbol!: string;

  @ApiProperty({
    description: 'The representative token name across all chains',
    example: MultiChainTokenMetadataExample.name,
  })
  name!: string;

  @ApiProperty({
    description: 'The representative token logo across all chains',
    example: MultiChainTokenMetadataExample.logoUrl,
  })
  logoUrl!: string;

  @ApiProperty({
    description: 'The chain IDs where this token is available',
    enum: ChainId,
    isArray: true,
    example: MultiChainTokenMetadataExample.chainIds,
  })
  chainIds!: ChainId[];
}
