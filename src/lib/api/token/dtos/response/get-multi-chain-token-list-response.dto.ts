import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MultiChainTokenDTO } from '../multi-chain-token.dto';

export class GetMultiChainTokenListResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of multi-chain tokens',
    type: [MultiChainTokenDTO],
  })
  readonly tokens: MultiChainTokenDTO[];

  constructor(tokens: MultiChainTokenDTO[]) {
    super({
      count: tokens.length,
      objectType: MultiChainTokenDTO,
    });
    this.tokens = tokens;
  }
}
