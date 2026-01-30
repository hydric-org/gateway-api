import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetTokenBasketListResponse } from '../dtos/response/get-token-basket-list-response.dto';

export function ApiGetMultipleChainBasketsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all token baskets across all supported networks.',
      description: 'Returns a complete list of all token baskets (e.g., Stablecoins, LSTs) available.',
    }),
    ApiOkResponse({
      description: 'The list of all available token baskets.',
      type: GetTokenBasketListResponse,
    }),
  );
}
