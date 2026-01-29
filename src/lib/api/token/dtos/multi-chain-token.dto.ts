import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { IMultiChainToken } from '@core/interfaces/token/multi-chain-token.interface';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
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
    description: 'The collection of underlying contract addresses for this asset across all supported networks.',
    type: [BlockchainAddress],
  })
  addresses!: BlockchainAddress[];

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

  @ApiProperty({
    description: 'The URL of the token logo. This is derived from the most liquid chain where the token is available.',
    example: TOKEN_LOGO(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
  })
  logoUrl!: string;

  @ApiProperty({
    description: `**Estimated Total Value Pooled (USD)**

Represents the total USD value of this token asset across all underlying chains.
Calculated as the sum of Total Value Pooled of each individual single-chain token in this group.`,
    example: 6500000000.0,
  })
  @RoundUsd()
  totalValuePooledUsd!: number;

  @ApiProperty({
    description: 'The chain IDs where this token is available',
    enum: ChainId,
    isArray: true,
    example: [ChainId.ETHEREUM, ChainId.BASE],
  })
  chainIds!: ChainId[];
}
