import { ApiProperty } from '@nestjs/swagger';

export class InvalidPaginationCursorMetadata {
  @ApiProperty({ description: 'The invalid cursor string received' })
  receivedCursor!: string;
}
