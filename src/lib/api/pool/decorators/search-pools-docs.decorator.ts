import { ErrorResponse } from '@lib/api/error/dtos/api-error.dto';
import { InvalidTokenIdError } from '@lib/api/token/errors/invalid-token-id.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { POOL_OUTPUT_SUBTYPES } from '../../pool/pool_output_subtypes';
import { PoolSearchRequest } from '../dtos/request/search-pools-request.dto';
import { PoolSearchResponse } from '../dtos/response/search-pools-response.dto';

const poolMapping = POOL_OUTPUT_SUBTYPES.reduce(
  (acc, model) => {
    const key = model.name.toUpperCase();
    acc[key] = getSchemaPath(model);
    return acc;
  },
  {} as Record<string, string>,
);

export function ApiSearchPoolsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search liquidity pools with advanced filtering',
      description: `
### Overview
Finds liquidity pools across multiple chains and protocols. This endpoint supports **Pair Search** (Token A vs Token B) and **Global Search**.

### Filtering Engine
* **Token Search:** Provide arrays in \`tokensA\` and \`tokensB\` to find specific pairs.
* **Protocol/Type:** Filter by \`protocol\` (e.g., \`uniswap-v3\`) or \`poolType\` (e.g., \`V4\`).
* **Timeframes:** Statistics (Volume/Fees) can be shifted via the \`timeframe\` parameter.

### Pagination
Uses **Cursor-based pagination**. Pass the \`nextCursor\` received from a previous response into the \`config.cursor\` field to fetch the next page.
      `,
    }),

    ApiBody({
      type: PoolSearchRequest,
      description: 'Search criteria and pagination config.',
    }),

    // 2. The Decorator configuration
    ApiOkResponse({
      description: `
Successfully retrieved a list of matching pools. 
The \`pools\` array contains polymorphic objects. Use the \`poolType\` field to distinguish between architectures:
${POOL_OUTPUT_SUBTYPES.map((model) => `* **${model.name}**: [${model.name}](#/components/schemas/${model.name})`).join('\n')}
  `,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PoolSearchResponse) },
          {
            properties: {
              pools: {
                type: 'array',
                items: {
                  discriminator: {
                    propertyName: 'poolType',
                    mapping: poolMapping,
                  },
                  oneOf: POOL_OUTPUT_SUBTYPES.map((model) => ({
                    $ref: getSchemaPath(model),
                  })),
                },
              },
            },
          },
        ],
      },
    }),

    ApiBadRequestResponse({
      description: 'One or more search parameters are invalid.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ErrorResponse) },
          example: ErrorResponse.from(new InvalidTokenIdError({ tokenId: 'bad-id' }), '/pools/search'),
        },
      },
    }),
  );
}
