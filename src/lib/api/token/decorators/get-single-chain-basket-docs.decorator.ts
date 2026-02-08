import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetTokenBasketResponse } from '../dtos/response/get-token-basket-response.dto';
import { InvalidBasketIdError } from '../errors/invalid-basket-id.error';

export function ApiGetSingleChainBasketDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a specific token basket for a specific network.',
      description:
        'Returns a detailed specific basket on a single blockchain network, containing only tokens for that network.',
    }),
    ApiOkResponse({
      description: 'The requested token basket.',
      type: GetTokenBasketResponse,
    }),
    ApiBadRequestResponse({
      description: 'Validation failed (Invalid Basket ID or Unsupported Chain ID).',
      content: {
        'application/json': {
          examples: {
            'Invalid Basket ID': {
              value: ErrorResponse.from(
                new InvalidBasketIdError({ basketId: 'invalid-id' }),
                `/tokens/baskets/${ChainId.ETHEREUM}/invalid-id`,
              ),
            },
            'Unsupported Chain ID': {
              value: ErrorResponse.from(
                new UnsupportedChainIdError({ chainId: 999999 }),
                `/tokens/baskets/${ChainId.ETHEREUM}/id`,
              ),
            },
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Token basket not found in the specified network.',
      content: {
        'application/json': {
          example: ErrorResponse.from(
            new TokenBasketNotFoundError({ basketId: BasketId.MONAD_PEGGED_TOKENS, chainId: ChainId.ETHEREUM }),
            `/tokens/baskets/${ChainId.ETHEREUM}/${BasketId.MONAD_PEGGED_TOKENS}`,
          ),
        },
      },
    }),
  );
}
