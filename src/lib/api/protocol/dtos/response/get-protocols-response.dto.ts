import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Protocol } from '../protocol.dto';

@ApiSchema({
  description: 'Response object for listing all supported protocols.',
})
export class GetProtocolsResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of supported protocols.',
    type: [Protocol],
  })
  readonly protocols: Protocol[];

  constructor(params: { protocols: Protocol[] }) {
    super({
      count: params.protocols.length,
      objectType: Protocol,
    });

    this.protocols = params.protocols;
  }
}
