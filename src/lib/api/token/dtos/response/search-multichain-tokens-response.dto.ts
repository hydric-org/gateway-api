import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MultiChainTokenMetadata } from '../multi-chain-token-metadata.dto';
import { MultiChainTokenSearchFilter } from '../multi-chain-token-search-filter.dto';

export class SearchMultichainTokensResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of matching Multichain tokens',
    type: [MultiChainTokenMetadata],
  })
  readonly tokens: MultiChainTokenMetadata[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page of search results. Null if no more results.',
    example: 'eJzLKCkpSs3LT0rNz0tRBAAdewMF',
    nullable: true,
  })
  readonly nextCursor: string | null;

  @ApiProperty({
    description: 'The filters applied to the search.',
    type: MultiChainTokenSearchFilter,
  })
  readonly filters: MultiChainTokenSearchFilter;

  constructor(
    tokens: MultiChainTokenMetadata[],
    filters: MultiChainTokenSearchFilter,
    nextCursor: string | null = null,
  ) {
    super({
      count: tokens.length,
      objectType: MultiChainTokenMetadata,
    });
    this.tokens = tokens;
    this.filters = filters;
    this.nextCursor = nextCursor;
  }
}
