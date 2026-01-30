import { TokenNotFoundError } from '@core/errors/token-not-found-error';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetSingleChainTokenResponse } from '../dtos/response/get-single-chain-token-response.dto';

export function ApiGetSingleChainTokenDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get detailed token information on a specific chain.',
      description: 'Retrieves comprehensive details about a token on a specific blockchain.',
    }),
    ApiOkResponse({
      description: 'The requested token information.',
      type: GetSingleChainTokenResponse,
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
            '/tokens/1/0x0000000000000000000000000000000000000001',
          ),
        },
      },
    }),
  );
}
