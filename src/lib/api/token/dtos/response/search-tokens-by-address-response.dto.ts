import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SingleChainTokenMetadata, SingleChainTokenMetadataExample } from '../single-chain-token-metadata.dto';

export class SearchTokensByAddressResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of tokens found at this address across different chains.',
    type: [SingleChainTokenMetadata],
    example: [SingleChainTokenMetadataExample],
  })
  readonly tokens: ISingleChainTokenMetadata[];

  constructor(tokens: ISingleChainTokenMetadata[]) {
    super({
      count: tokens.length,
      objectType: SingleChainTokenMetadata,
    });
    this.tokens = tokens;
  }
}
