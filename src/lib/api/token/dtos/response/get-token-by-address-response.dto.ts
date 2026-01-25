import { ChainIdUtils } from '@core/enums/chain-id';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SingleChainToken, SingleChainTokenExample } from '../single-chain-token.dto';

export class GetTokenByAddressResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of tokens found at this address across different chains.',
    type: [SingleChainToken],
    example: [
      {
        ...SingleChainTokenExample,
        chainId: ChainIdUtils.values()[0],
      },
    ],
  })
  readonly tokens: ISingleChainToken[];

  constructor(tokens: ISingleChainToken[]) {
    super({
      count: tokens.length,
      objectType: SingleChainToken,
    });
    this.tokens = tokens;
  }
}
