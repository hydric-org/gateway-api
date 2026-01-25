import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetTokenByAddressResponse } from '../dtos/response/get-token-by-address-response.dto';

export function ApiGetTokenByAddressDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find a token by its contract address.',
      description: `
Searches for a token at the specified contract address in all supported blockchain networks.

**Note:** You can optionally filter the chains to search in via the \`chainIds\` query parameter. Supports both comma-separated values (\`?chainIds=1,143\`) and repeated keys (\`?chainIds=1&chainIds=143\`).`,
    }),
    ApiQuery({
      name: 'chainIds',
      description: 'Optional list of chain IDs to restrict the lookup to.',
      required: false,
      example: '1,143',
      type: String,
    }),
    ApiOkResponse({
      description: 'Tokens found at the specified address.',
      type: GetTokenByAddressResponse,
    }),
  );
}
