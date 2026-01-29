import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const SingleChainTokenExample = {
  id: '1-0x0000000000000000000000000000000000000000',
  chainId: ChainId.ETHEREUM,
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
  logoUrl: TOKEN_LOGO(1, '0x0000000000000000000000000000000000000000'),
  totalValuePooledUsd: 154000000.5,
} satisfies SingleChainToken;

@ApiSchema({
  description: 'Information about a token inside a specific blockchain',
})
@ObjectCost(5)
export class SingleChainToken implements ISingleChainToken {
  @ApiProperty({
    description: 'The unique identifier of the token ({chainId}-{tokenAddress})',
    example: SingleChainTokenExample.id,
  })
  readonly id!: string;

  @ApiProperty({
    description: 'The chain id of the network where the token resides.',
    example: SingleChainTokenExample.chainId,
    enum: ChainId,
  })
  readonly chainId!: ChainId;

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

  @ApiProperty({
    description: 'The URL of the token logo.',
    example: SingleChainTokenExample.logoUrl,
  })
  readonly logoUrl!: string;

  @ApiProperty({
    description: `**Estimated Total Value Pooled (USD)**

Represents the total USD value of this token currently locked in liquidity pools indexed by hydric.`,
    example: 154000000.5,
  })
  @RoundUsd()
  readonly totalValuePooledUsd!: number;
}
