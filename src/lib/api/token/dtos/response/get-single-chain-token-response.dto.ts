import { ISingleChainTokenInfo } from '@core/interfaces/token/single-chain-token-info.interface';
import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SingleChainTokenInfo, SingleChainTokenInfoExample } from '../single-chain-token-info.dto';

export class GetSingleChainTokenResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'The requested token information.',
    type: SingleChainTokenInfo,
    example: SingleChainTokenInfoExample,
  })
  readonly token: ISingleChainTokenInfo;

  constructor(token: ISingleChainTokenInfo) {
    super({
      count: 1,
      objectType: SingleChainTokenInfo,
    });
    this.token = token;
  }
}
