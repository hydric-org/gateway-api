import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetTokenBasketsListQueryParams } from '../dtos/request/get-token-baskets-list-query-params.dto';
import { GetTokenBasketListResponse } from '../dtos/response/get-token-basket-list-response.dto';

export function ApiGetMultipleChainBasketsDocs() {
  return applyDecorators(
    ApiExtraModels(GetTokenBasketsListQueryParams),
    ApiOperation({
      summary: 'Get all token baskets across multiple networks.',
      description:
        'Returns all token baskets (e.g., Stablecoins, LSTs). Use `chainIds` to filter by network and `basketIds` to filter by specific basket types. If omitted, defaults to all supported networks and baskets.',
    }),
    ApiOkResponse({
      description: 'The list of available token baskets.',
      type: GetTokenBasketListResponse,
    }),
  );
}
