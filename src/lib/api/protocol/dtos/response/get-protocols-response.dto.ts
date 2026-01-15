import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Protocol } from '../protocol.dto';

@ApiSchema({
  description: 'Response object for listing all supported protocols.',
})
export class GetProtocolsResponse {
  @ApiProperty({
    description: 'List of supported protocols.',
    type: [Protocol],
  })
  readonly protocols!: Protocol[];
}
