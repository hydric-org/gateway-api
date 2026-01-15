import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: 'Global Success Response that every endpoint returns.',
})
export class SuccessResponseDto<T> {
  @ApiProperty({ description: 'HTTP status code.', example: 200 })
  statusCode!: number;

  @ApiProperty({ description: 'ISO 8601 Timestamp.', example: '2026-01-11T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ description: 'Request Path.', example: '/pools' })
  path!: string;

  @ApiProperty({ description: 'Unique Trace ID for observability.', example: 'req_123abc' })
  traceId!: string;

  @ApiProperty({ description: 'The data payload.', nullable: true })
  data!: T;

  static from<T>(data: T, path = '/example/path'): SuccessResponseDto<T> {
    return {
      statusCode: 200,
      timestamp: '2026-01-01T12:00:00.000Z',
      path,
      traceId: 'doc_sample_trace_id',
      data,
    };
  }
}
