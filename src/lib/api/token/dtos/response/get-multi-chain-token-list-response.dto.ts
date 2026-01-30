import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MultiChainTokenMetadata } from '../multi-chain-token-metadata.dto';

export class GetMultiChainTokenListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of multi-chain tokens',
    type: [MultiChainTokenMetadata],
  })
  readonly tokens: MultiChainTokenMetadata[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page. Null if no more results.',
    example: 'eJzLKCkpSs3LT0rNz0tRBAAdewMF',
    nullable: true,
  })
  readonly nextCursor: string | null;

  constructor(tokens: MultiChainTokenMetadata[], nextCursor: string | null = null) {
    super({
      count: tokens.length,
      objectType: MultiChainTokenMetadata,
    });
    this.tokens = tokens;
    this.nextCursor = nextCursor;
  }
}
