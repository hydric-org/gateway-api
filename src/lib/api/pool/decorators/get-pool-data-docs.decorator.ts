import { Network } from '@core/enums/network';
import { PoolNotFoundError } from '@core/errors/pool-not-found.error';
import { ErrorResponse } from '@lib/api/error/dtos/api-error.dto';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { POOL_OUTPUT_SUBTYPES, POOL_OUTPUT_SUBTYPE_ENTRIES } from '@lib/api/pool/pool_output_subtypes';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { Pool, PoolExample } from '../dtos/output/pool-output.dto';
import { InvalidPoolAddressError } from '../errors/invalid-pool-address.error';

export function ApiGetSinglePoolDocs() {
  const okExamples = POOL_OUTPUT_SUBTYPE_ENTRIES.reduce(
    (acc, entry) => {
      const example = entry.example as Pool;
      const examplePoolType = example?.poolType;
      const basePoolType = PoolExample.poolType;
      const useExamplePoolType = examplePoolType && String(examplePoolType) !== String(basePoolType);

      const derivedType = useExamplePoolType ? String(examplePoolType) : entry.model.name;
      const key = derivedType || entry.model.name;
      acc[key] = { summary: `${key} Pool`, value: example };
      return acc;
    },
    {} as Record<string, { summary: string; value: any }>,
  );

  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve pool metadata',
      description: `
### Overview
Fetches data for a specific liquidity pool.

### Polymorphic Response
This endpoint returns different data structures depending on the \`poolType\`. for example:
* **V3:** Includes \`tickSpacing\`, \`sqrtPriceX96\` and more.
* **V4:** Includes \`hook\`, \`stateViewAddress\` and more.

Check out the schema for each poolType to see what data is included in the response.
      `,
    }),

    ApiOkResponse({
      description: 'The pool data was successfully retrieved.',
      examples: {
        ...okExamples,
      },
      schema: {
        allOf: [
          { $ref: getSchemaPath(Pool) },
          {
            properties: {
              poolType: { type: 'string' },
            },
            discriminator: { propertyName: 'poolType' },
            oneOf: POOL_OUTPUT_SUBTYPES.map((model) => ({
              $ref: getSchemaPath(model),
            })),
          },
        ],
      },
    }),

    ApiBadRequestResponse({
      description: 'Validation failed.',
      type: ErrorResponse,
      examples: {
        'Invalid Address': {
          summary: 'Invalid Pool Address',
          value: ErrorResponse.from(new InvalidPoolAddressError({ poolAddress: '0x123' }), '/pools/0x123'),
        },
        'Unsupported ChainId': {
          summary: 'Unsupported Chain ID',
          value: ErrorResponse.from(new UnsupportedChainIdError({ chainId: 2 }), '/pools/0x123'),
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Pool not found.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ErrorResponse) },
          example: ErrorResponse.from(
            new PoolNotFoundError({ chainId: Network.BASE, poolAddress: '0x123' }),
            '/pools/0x123',
          ),
        },
      },
    }),
  );
}
