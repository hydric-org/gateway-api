import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyNotFoundMetadata {
  @ApiProperty({ example: 'sk_l...123', description: 'The masked API key that was received' })
  receivedKey!: string;
}
