import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SingleChainToken } from '../single-chain-token.dto';
import { TokenFilter } from '../token-filter.dto';

export class SearchSingleChainTokensResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of matching tokens on the specified blockchain',
    type: [SingleChainToken],
  })
  readonly tokens: SingleChainToken[];

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

  constructor(tokens: SingleChainToken[], filters: TokenFilter, nextCursor: string | null = null) {
    super({
      count: tokens.length,
      objectType: SingleChainToken,
    });
    this.tokens = tokens;
    this.filters = filters;
    this.nextCursor = nextCursor;
  }
}
