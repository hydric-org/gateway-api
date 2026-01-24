import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MultiChainTokenDTO } from '../multi-chain-token.dto';
import { TokenFilter } from '../token-filter.dto';

export class SearchMultichainTokensResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of matching Multichain tokens',
    type: [MultiChainTokenDTO],
  })
  readonly tokens: MultiChainTokenDTO[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page of search results. Null if no more results.',
    example: 'eJzLKCkpSs3LT0rNz0tRBAAdewMF',
    nullable: true,
  })
  readonly nextCursor: string | null;

  @ApiProperty({
    description: 'The filters applied to the search.',
    type: TokenFilter,
  })
  readonly filters: TokenFilter;

  constructor(tokens: MultiChainTokenDTO[], filters: TokenFilter, nextCursor: string | null = null) {
    super({
      count: tokens.length,
      objectType: MultiChainTokenDTO,
    });
    this.tokens = tokens;
    this.filters = filters;
    this.nextCursor = nextCursor;
  }
}
