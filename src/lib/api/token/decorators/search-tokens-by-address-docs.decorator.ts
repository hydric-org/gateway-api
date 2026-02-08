import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchTokensByAddressResponse } from '../dtos/response/search-tokens-by-address-response.dto';

export function ApiSearchTokensByAddressDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search for a token by address across multiple chains.',
      description: `
Searches for a token at the specified contract address in all supported blockchain networks (or a subset via \`chainIds\`).

Returns a list of matching tokens with their metadata (Chain ID, Name, Symbol, Decimals). Does **not** include Pool TVL metrics.
      `,
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
      type: SearchTokensByAddressResponse,
    }),
  );
}
