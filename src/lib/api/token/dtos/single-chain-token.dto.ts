import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const SingleChainTokenExample = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
} satisfies SingleChainToken;

@ApiSchema({
  description: 'Information about a token inside a specific blockchain',
})
@ObjectCost(5)
export class SingleChainToken implements ISingleChainToken {
  @ApiProperty({
    description: `
The contract address of the token on its host network.

* **ERC-20 Tokens:** The 20-byte hex contract address.
* **Native Assets (e.g., ETH, MATIC):** Represented by the "Zero Address" (\`0x000...000\`).
    `,
    example: SingleChainTokenExample.address,
  })
  readonly address!: string;

  @ApiProperty({
    description:
      'The number of decimal places used to represent the smallest fractional unit of the token (e.g., 18 for ETH, 6 for USDC).',
    example: SingleChainTokenExample.decimals,
  })
  readonly decimals!: number;

  @ApiProperty({
    description: 'The full human-readable name of the asset (e.g., "Ethereum", "Wrapped Bitcoin").',
    example: SingleChainTokenExample.name,
  })
  readonly name!: string;

  @ApiProperty({
    description:
      'The ticker symbol of the token (e.g., "ETH", "WBTC"). Note: Symbols are not guaranteed to be unique across all tokens.',
    example: SingleChainTokenExample.symbol,
  })
  readonly symbol!: string;
}
