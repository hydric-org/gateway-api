import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyNotFoundMetadata {
  @ApiProperty({ example: 'sk_...', description: 'The API key that was not found' })
  receivedKey!: string;
}
