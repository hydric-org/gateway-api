import { ProtocolOutputDTO } from '@lib/api/protocol/dtos/protocol-output.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetProtocolsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List all supported protocols',
      description: `
### Overview
Returns a comprehensive list of all decentralized exchanges supported by the API.

### Response Data
Each protocol includes but is not limited to:
* **ID:** The unique kebab-case identifier used in filters.
* **Name:** The human-readable brand name.
      `,
    }),
    ApiResponse({
      status: 200,
      description: 'List of supported protocols retrieved successfully.',
      isArray: true,
      type: ProtocolOutputDTO,
    }),
  );
}
