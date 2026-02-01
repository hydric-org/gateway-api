import { TokenNotFoundError } from '@core/errors/token-not-found-error';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetTokenPriceResponse } from '../dtos/response/get-token-price-response.dto';

export function ApiGetTokenUsdPriceDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get token USD price',
      description:
        'Returns the current USD price of a token on a specific chain. If the zero address is provided, it returns the native token price (with wrapped native fallback).',
    }),
    ApiOkResponse({
      description: 'The requested token USD price.',
      type: GetTokenPriceResponse,
    }),
    ApiNotFoundResponse({
      description: 'The requested token was not found on the specified chain.',
      content: {
        'application/json': {
          example: ErrorResponse.from(
            new TokenNotFoundError({
              chainId: 1,
              tokenAddress: '0x0000000000000000000000000000000000000001',
            }),
            '/tokens/prices/1/0x0000000000000000000000000000000000000001/usd',
          ),
        },
      },
    }),
  );
}
