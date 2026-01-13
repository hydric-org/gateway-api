import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetStatusDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'System Status Check',
      description: 'Provides real-time status of the API instance, including uptime, environment, and versioning.',
    }),
    ApiResponse({
      status: 200,
      description: 'The service is healthy and reachable.',
      schema: {
        example: {
          status: 'OK',
          uptimeSeconds: 12450,
          env: 'production',
          host: 'api-primary-01',
          version: '1.2.0',
          timestamp: '2026-01-12T16:22:54Z',
        },
      },
    }),
  );
}
