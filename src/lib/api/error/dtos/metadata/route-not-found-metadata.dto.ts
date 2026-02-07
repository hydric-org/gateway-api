import { ApiProperty } from '@nestjs/swagger';

export class RouteNotFoundMetadata {
  @ApiProperty({ description: 'The HTTP method used in the request', example: 'GET' })
  method!: string;
}
