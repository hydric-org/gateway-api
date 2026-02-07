import { ApiProperty } from '@nestjs/swagger';

export class InvalidBasketIdMetadata {
  @ApiProperty({ description: 'The requested basket identifier' })
  basketId!: string;

  @ApiProperty({ description: 'List of supported IDs', type: [String] })
  supportedIds!: string[];
}
