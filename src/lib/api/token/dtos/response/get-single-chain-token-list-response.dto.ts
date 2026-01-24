import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SingleChainToken } from '../single-chain-token.dto';

export class GetSingleChainTokenListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of tokens on the specified blockchain',
    type: [SingleChainToken],
  })
  readonly tokens: SingleChainToken[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page. Null if no more results.',
    example: 'eJzLKCkpSs3LT0rNz0tRBAAdewMF',
    nullable: true,
  })
  readonly nextCursor: string | null;

  constructor(tokens: SingleChainToken[], nextCursor: string | null = null) {
    super({
      count: tokens.length,
      objectType: SingleChainToken,
    });
    this.tokens = tokens;
    this.nextCursor = nextCursor;
  }
}
