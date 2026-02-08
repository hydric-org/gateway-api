import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetMultipleChainsTokenBasketsQueryParams } from '../dtos/request/get-token-baskets-query-params.dto';
import { GetTokenBasketListResponse } from '../dtos/response/get-token-basket-list-response.dto';

export function ApiGetMultipleChainBasketsDocs() {
  return applyDecorators(
    ApiExtraModels(GetMultipleChainsTokenBasketsQueryParams),
    ApiOperation({
      summary: 'Get all token baskets across multiple networks.',
      description:
        'Returns all token baskets (e.g., Stablecoins, LSTs). Use the `chainIds` query parameter to filter to specific networks; if omitted, defaults to all supported networks.',
    }),
    ApiOkResponse({
      description: 'The list of available token baskets.',
      type: GetTokenBasketListResponse,
    }),
  );
}
