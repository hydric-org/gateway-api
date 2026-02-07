import { ApiProperty } from '@nestjs/swagger';

export class UnsupportedChainIdMetadata {
  @ApiProperty({
    description: 'The chain ID or list of chain IDs relative to the error',
    oneOf: [{ type: 'number' }, { type: 'array', items: { type: 'number' } }],
  })
  chainId!: number | number[];

  @ApiProperty({ description: 'List of unsupported IDs found', type: [Number] })
  unsupportedIds!: number[];

  @ApiProperty({ description: 'List of supported IDs valid for this operation', type: [Number] })
  supportedIds!: number[];
}
