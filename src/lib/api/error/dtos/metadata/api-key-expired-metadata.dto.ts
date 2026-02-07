import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyExpiredMetadata {
  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The date when the API key expired' })
  expiredAt!: string;
}
