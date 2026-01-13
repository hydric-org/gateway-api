import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const SingleChainTokenOutputDTOExample = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
} satisfies SingleChainTokenOutputDTO;

@ApiSchema({
  description: `
**Single-Chain Token Model**

Detailed metadata for an asset residing on a specific network. 
This model provides the precision (\`decimals\`) and identification (\`address\`) required to perform 
on-chain swaps and balance calculations.
  `,
})
export class SingleChainTokenOutputDTO implements ISingleChainToken {
  @ApiProperty({
    description: `
The contract address of the token on its host network.

* **ERC-20 Tokens:** The 20-byte hex contract address.
* **Native Assets (e.g., ETH, MATIC):** Represented by the "Zero Address" (\`0x000...000\`).
    `,
    example: SingleChainTokenOutputDTOExample.address,
  })
  readonly address!: string;

  @ApiProperty({
    description:
      'The number of decimal places used to represent the smallest fractional unit of the token (e.g., 18 for ETH, 6 for USDC).',
    example: SingleChainTokenOutputDTOExample.decimals,
  })
  readonly decimals!: number;

  @ApiProperty({
    description: 'The full human-readable name of the asset (e.g., "Ethereum", "Wrapped Bitcoin").',
    example: SingleChainTokenOutputDTOExample.name,
  })
  readonly name!: string;

  @ApiProperty({
    description:
      'The ticker symbol of the token (e.g., "ETH", "WBTC"). Note: Symbols are not guaranteed to be unique across all tokens.',
    example: SingleChainTokenOutputDTOExample.symbol,
  })
  readonly symbol!: string;
}
