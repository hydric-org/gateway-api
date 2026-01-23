import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MultiChainTokenDTO } from '../multi-chain-token.dto';

export class GetMultiChainTokenListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of multi-chain tokens',
    type: [MultiChainTokenDTO],
  })
  readonly tokens: MultiChainTokenDTO[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page. Null if no more results.',
    example: 'eJzLKCkpSs3LT0rNz0tRBAAdewMF',
    nullable: true,
  })
  readonly nextCursor: string | null;

  constructor(tokens: MultiChainTokenDTO[], nextCursor: string | null = null) {
    super({
      count: tokens.length,
      objectType: MultiChainTokenDTO,
    });
    this.tokens = tokens;
    this.nextCursor = nextCursor;
  }
}
