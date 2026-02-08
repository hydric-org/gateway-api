import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { GenericValidationError } from '@lib/api/error/errors/generic-validation.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetMultiChainTokenListResponse } from '../dtos/response/get-multi-chain-token-list-response.dto';

export function ApiGetMultiChainTokenListDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a unified list of multi-chain assets',
      description: `
Returns a list of tokens containing metadata for multiple blockchains in one single model.

### Key Capabilities:
- **Cross-Chain Discovery:** Instantly identify every network where a specific asset maintains a liquidity presence.
- **Metadata Consolidation:** Retrieve a single, high-fidelity model containing localized contract addresses and decimal precision for every supported chain.
- **Operational Efficiency:** Eliminate the need for manual network switching or multiple RPC calls to resolve cross-chain token identities.`,
    }),
    ApiOkResponse({
      description: 'The registry of multi-chain assets was successfully retrieved.',
      type: GetMultiChainTokenListResponse,
    }),
    ApiBadRequestResponse({
      description: 'Invalid limit parameter.',
      example: ErrorResponse.from(
        new GenericValidationError({
          validationErrorDescription: 'limit must not be greater than 1000',
          meta: {
            property: 'limit',
            value: 101,
            constraints: { max: ['limit must not be greater than 1000'] },
          },
        }),
        '/tokens',
      ),
    }),
  );
}
