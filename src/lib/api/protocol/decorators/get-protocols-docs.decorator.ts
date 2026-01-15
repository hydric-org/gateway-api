import { GetProtocolsResponse } from '@lib/api/protocol/dtos/response/get-protocols-response.dto';
import { ApiSuccessResponse } from '@lib/api/success/decorators/api-success-response.decorator';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetProtocolsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List all supported protocols',
      description: `
### Overview
Returns a comprehensive list of all protocols supported by the API across all blockchains.

### Response Data
Each protocol includes but is not limited to:
* **ID:** The unique kebab-case identifier used in filters.
* **Name:** The human-readable brand name.
      `,
    }),
    ApiSuccessResponse(GetProtocolsResponse, {
      description: 'List of supported protocols retrieved successfully.',
    }),
  );
}
