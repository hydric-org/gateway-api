import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnknownErrorMetadata {
  @ApiPropertyOptional({ description: 'The name of the exception that was thrown', example: 'InternalServerError' })
  exceptionName?: string;
}
