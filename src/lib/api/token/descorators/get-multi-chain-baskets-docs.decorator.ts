import { ChainId } from '@core/enums/chain-id';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetTokenBasketListResponse } from '../dtos/response/get-token-basket-list-response.dto';

export function ApiGetMultipleChainBasketsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get token baskets across multiple networks.',
      description:
        'Returns all token baskets (e.g., Stablecoins, LSTs). Use the `chainIds` query parameter to filter to specific networks; if omitted, defaults to all supported networks.',
    }),
    ApiQuery({
      name: 'chainIds',
      description:
        'Filter results to specific networks by chain ID. Comma-separated list. If omitted, defaults to all supported networks.',
      required: false,
      example: '1,8453',
      enum: ChainId,
      isArray: true,
    }),
    ApiOkResponse({
      description: 'The list of available token baskets.',
      type: GetTokenBasketListResponse,
    }),
  );
}
