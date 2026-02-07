import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvalidProtocolIdMetadata {
  @ApiProperty({ description: 'The invalid item(s) received' })
  received!: unknown;

  @ApiPropertyOptional({ description: 'Count of invalid items found' })
  invalidCount?: number;

  @ApiPropertyOptional({ description: 'List of specific invalid items' })
  invalidItems?: unknown[];
}
