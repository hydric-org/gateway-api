import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SingleChainTokenMetadata } from '../single-chain-token-metadata.dto';

export class GetSingleChainTokenListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of tokens on the specified blockchain',
    type: [SingleChainTokenMetadata],
  })
  readonly tokens: SingleChainTokenMetadata[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page. Null if no more results.',
    example: 'eJzLKCkpSs3LT0rNz0tRBAAdewMF',
    nullable: true,
  })
  readonly nextCursor: string | null;

  constructor(tokens: SingleChainTokenMetadata[], nextCursor: string | null = null) {
    super({
      count: tokens.length,
      objectType: SingleChainTokenMetadata,
    });
    this.tokens = tokens;
    this.nextCursor = nextCursor;
  }
}
