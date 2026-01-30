import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const SingleChainTokenMetadataExample: ISingleChainTokenMetadata = {
  chainId: ChainId.ETHEREUM,
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
  logoUrl: TOKEN_LOGO(1, '0x0000000000000000000000000000000000000000'),
};

@ApiSchema({
  description: 'Core identifying metadata for a token on a single blockchain.',
})
@ObjectCost(5)
export class SingleChainTokenMetadata implements ISingleChainTokenMetadata {
  @ApiProperty({
    description: 'The chain id of the network where the token resides.',
    example: SingleChainTokenMetadataExample.chainId,
    enum: ChainId,
  })
  readonly chainId!: ChainId;

  @ApiProperty({
    description: `
The contract address of the token on its host network.

* **ERC-20 Tokens:** The 20-byte hex contract address.
* **Native Assets (e.g., ETH, MATIC):** Represented by the "Zero Address" (\`0x000...000\`).
    `,
    example: SingleChainTokenMetadataExample.address,
  })
  readonly address!: string;

  @ApiProperty({
    description:
      'The number of decimal places used to represent the smallest fractional unit of the token (e.g., 18 for ETH, 6 for USDC).',
    example: SingleChainTokenMetadataExample.decimals,
  })
  readonly decimals!: number;

  @ApiProperty({
    description: 'The full human-readable name of the asset (e.g., "Ethereum", "Wrapped Bitcoin").',
    example: SingleChainTokenMetadataExample.name,
  })
  readonly name!: string;

  @ApiProperty({
    description: 'The ticker symbol of the token (e.g., "ETH", "WBTC")..',
    example: SingleChainTokenMetadataExample.symbol,
  })
  readonly symbol!: string;

  @ApiProperty({
    description: 'The URL of the token logo.',
    example: SingleChainTokenMetadataExample.logoUrl,
  })
  readonly logoUrl!: string;
}
