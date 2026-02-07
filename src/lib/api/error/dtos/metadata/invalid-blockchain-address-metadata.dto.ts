import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvalidBlockchainAddressMetadata {
  @ApiProperty({
    description: 'One or more invalid chain identities (chainId + address)',
    oneOf: [
      { type: 'object', properties: { address: { type: 'string' }, reason: { type: 'string' } } },
      {
        type: 'array',
        items: { type: 'object', properties: { address: { type: 'string' }, reason: { type: 'string' } } },
      },
    ],
  })
  invalidAddresses!: unknown;

  @ApiProperty({ description: 'Total number of addresses received' })
  receivedCount!: number;

  @ApiPropertyOptional({ description: 'Number of invalid addresses found' })
  totalInvalid?: number;
}
