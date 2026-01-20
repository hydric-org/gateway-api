import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetMultiChainTokenListResponse } from '../dtos/response/get-multi-chain-token-list-response.dto';

export function ApiGetMultiChainTokenListDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unified List of Multi-Chain Assets',
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
  );
}
