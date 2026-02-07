import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyInvalidMetadata {
  @ApiProperty({ example: 'Invalid format', description: 'Reason why the API key is considered invalid' })
  reason!: string;
}
