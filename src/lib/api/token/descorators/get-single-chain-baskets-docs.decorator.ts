import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetTokenBasketListResponse } from '../dtos/response/get-token-basket-list-response.dto';

export function ApiGetSingleChainBasketsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all token baskets available on a specific network.',
      description: 'Returns all token baskets that contain assets for the specified blockchain network.',
    }),
    ApiOkResponse({
      description: 'The list of token baskets available on the network.',
      type: GetTokenBasketListResponse,
    }),
    ApiBadRequestResponse({
      description: 'Unsupported chain ID.',
      content: {
        'application/json': {
          example: ErrorResponse.from(new UnsupportedChainIdError({ chainId: 999999 }), `/tokens/baskets/chain/999999`),
        },
      },
    }),
  );
}
