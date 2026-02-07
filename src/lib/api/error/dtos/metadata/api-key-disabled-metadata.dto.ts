import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyDisabledMetadata {
  @ApiProperty({ example: 'The API key has been revoked.' })
  reason?: string;
}
