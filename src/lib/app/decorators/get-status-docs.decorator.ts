import { SystemStatusDto } from '@lib/api/health/dtos/system-status-output.dto';
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
      type: SystemStatusDto,
    }),
  );
}
