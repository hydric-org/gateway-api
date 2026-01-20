import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MultiChainTokenDto } from './multi-chain-token.dto';

export class GetMultiChainTokenListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of multi-chain tokens',
    type: [MultiChainTokenDto],
  })
  readonly tokens: MultiChainTokenDto[];

  constructor(tokens: MultiChainTokenDto[]) {
    super({
      count: tokens.length,
      objectType: MultiChainTokenDto,
    });
    this.tokens = tokens;
  }
}
