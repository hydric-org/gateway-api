import { BaseError } from '@core/errors/base-core-error';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiErrorCode, ApiErrorCodeUtils } from '../api-error-codes';

export class ApiErrorContentDTO {
  @ApiProperty({
    description: 'A stable machine-readable code for programmatic handling.',
    enum: ApiErrorCode,
    example: ApiErrorCode.INVALID_POOL_ADDRESS,
  })
  code!: string;

  @ApiProperty({
    description: 'A human-readable short summary.',
    example: 'Invalid Parameters',
  })
  title!: string;

  @ApiProperty({
    description: 'A detailed explanation of the error.',
    example: 'The provided pool address does not match the expected format.',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Technical hints or internal reference (often hidden in production).',
    example: 'Check the poolAddress regex requirements.',
  })
  details?: string;

  @ApiPropertyOptional({
    description: 'Dynamic context data useful for debugging or UI handling.',
    example: { poolAddress: '0xInvalid' },
  })
  meta?: Record<string, any>;
}

export class ApiErrorResponseDTO {
  @ApiProperty({ description: 'HTTP status code.', example: 400, enum: HttpStatus })
  statusCode!: HttpStatus;

  @ApiProperty({ description: 'ISO 8601 Timestamp.', example: '2026-01-11T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ description: 'Request Path.', example: '/pools' })
  path!: string;

  @ApiProperty({ description: 'Unique Trace ID for observability.', example: 'req_123abc' })
  traceId!: string;

  @ApiProperty({ type: ApiErrorContentDTO })
  error!: ApiErrorContentDTO;

  static from(error: BaseError, path = '/example/path'): ApiErrorResponseDTO {
    const code = error.params.errorCode;

    const statusCode = ApiErrorCodeUtils.toStatusCode[code] || HttpStatus.BAD_REQUEST;

    return {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      traceId: 'doc_sample_trace_id',
      error: {
        code,
        title: ApiErrorCodeUtils.toTitle[code] || 'Error',
        message: error.message,
        details: error.params.details,
        meta: error.params.meta,
      },
    };
  }
}
