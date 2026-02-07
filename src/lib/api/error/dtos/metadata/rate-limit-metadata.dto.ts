import { ApiProperty } from '@nestjs/swagger';

export class RateLimitMetadata {
  @ApiProperty({ example: 60 })
  retryAfterSeconds!: number;
}
