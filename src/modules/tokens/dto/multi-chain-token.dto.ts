import { ChainId } from '@core/enums/chain-id';
import { IMultiChainToken } from '@core/interfaces/token/multi-chain-token.interface';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty } from '@nestjs/swagger';

@ObjectCost(15)
export class MultiChainTokenDto implements IMultiChainToken {
  @ApiProperty({
    description: 'The unique identifiers of the token across chains (format: chainId-address)',
    example: ['1-0x...', '137-0x...'],
    type: [String],
  })
  ids!: string[];

  @ApiProperty({
    description: 'The addresses of the token on each chain',
    example: ['0x...', '0x...'],
    type: [String],
  })
  addresses!: string[];

  @ApiProperty({
    description: 'The chain IDs where this token is available',
    enum: ChainId,
    isArray: true,
    example: [1, 137],
  })
  chainIds!: ChainId[];

  @ApiProperty({
    description: 'The specific decimals for each token address',
    example: { '0x123...': 18, '0x456...': 6 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  decimals!: Record<string, number>;

  @ApiProperty({
    description: 'The symbol of the token',
    example: 'USDC',
  })
  symbol!: string;

  @ApiProperty({
    description: 'The name of the token',
    example: 'USD Coin',
  })
  name!: string;
}
