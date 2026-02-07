import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyMissingMetadata {
  @ApiProperty({ example: 'Bearer <api-key>', description: 'Example of how to provide the API key' })
  example!: string;
}
