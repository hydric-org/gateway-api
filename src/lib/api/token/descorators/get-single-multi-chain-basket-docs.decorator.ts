import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetTokenBasketResponse } from '../dtos/response/get-token-basket-response.dto';
import { InvalidBasketIdError } from '../errors/invalid-basket-id.error';

export function ApiGetSingleBasketInMultipleChainsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a specific token basket by ID across all networks.',
      description:
        'Returns the aggregated basket data for a specific basket ID (e.g., "usd-stablecoins") across all supported networks.',
    }),
    ApiOkResponse({
      description: 'The requested token basket data.',
      type: GetTokenBasketResponse,
    }),
    ApiBadRequestResponse({
      description: 'Invalid basket ID format.',
      content: {
        'application/json': {
          example: ErrorResponse.from(
            new InvalidBasketIdError({ basketId: 'invalid-id' }),
            '/tokens/baskets/invalid-id',
          ),
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Token basket not found on any network.',
      content: {
        'application/json': {
          example: ErrorResponse.from(
            new TokenBasketNotFoundError({ basketId: BasketId.USD_STABLECOINS }),
            '/tokens/baskets/usd-stablecoins',
          ),
        },
      },
    }),
  );
}
