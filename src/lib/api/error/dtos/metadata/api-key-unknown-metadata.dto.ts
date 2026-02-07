import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyUnknownMetadata {
  @ApiProperty({ description: 'Additional details about the unknown API key error' })
  details?: string;
}
