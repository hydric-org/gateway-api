import { ChainId } from '@core/enums/chain-id';
import { IMultiChainToken } from '@core/interfaces/token/multi-chain-token.interface';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'MultiChainToken',
  description: `A normalized representation of a single asset across multiple blockchain ecosystems. 
  
hydric aggregates fragmented chain-specific metadata into this unified model to simplify cross-chain portfolio and liquidity tracking.`,
})
@ObjectCost(15)
export class MultiChainTokenDTO implements IMultiChainToken {
  @ApiProperty({
    description: `
    The unique identifiers of the token across chains.
    - **Format:** \`{chainId}-{address}\`
    - **Native Assets:** Represented by the "Zero Address" (\`0x000...000\`).
    `,
    example: ['1-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '8453-0xdbfefd2e8460a6ee4955a68582f85708baea60a3'],
    type: [String],
  })
  ids!: string[];

  @ApiProperty({
    description: 'The collection of underlying contract addresses for this asset across all supported networks.',
    example: ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xdbfefd2e8460a6ee4955a68582f85708baea60a3'],
    type: [String],
  })
  addresses!: string[];

  @ApiProperty({
    description: 'The chain IDs where this token is available',
    enum: ChainId,
    isArray: true,
    example: [ChainId.ETHEREUM, ChainId.BASE],
  })
  chainIds!: ChainId[];

  @ApiProperty({
    description: 'A map of token addresses to their respective decimals on each chain.',
    example: { '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 18, '0xdbfefd2e8460a6ee4955a68582f85708baea60a3': 18 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  decimals!: Record<string, number>;

  @ApiProperty({
    description: `**The representative token symbol across all chains.**

The symbol is taken from the first token in the returned list, which is ordered according to the requested sorting criteria (e.g. TVL, symbol, etc.).
For example, if tokens are ordered by TVL, the symbol corresponds to the token with the highest TVL; if ordered by symbol, it corresponds to the first token alphabetically.`,
    example: 'USDC',
  })
  symbol!: string;

  @ApiProperty({
    description: `**The representative token name across all chains.**
    
The name is taken from the first token in the returned list, which is ordered according to the requested sorting criteria (e.g. TVL, name, etc.).
For example, if tokens are ordered by TVL, the name corresponds to the token with the highest TVL; if ordered by name, it corresponds to the first token alphabetically.`,
    example: 'USD Coin',
  })
  name!: string;
}
