import { Network } from '@core/enums/network';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { InvalidBlockchainAddressError } from '@lib/api/address/errors/invalid-blockchain-address.error';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { ApiSuccessResponse } from '@lib/api/success/decorators/api-success-response.decorator';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { SearchLiquidityPoolsRequestParams } from '../dtos/request-params/search-liquidity-pools-request-params.dto';
import { SearchLiquidityPoolsResponse } from '../dtos/response/search-liquidity-pools-response.dto';

export function SearchLiquidityPoolsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search liquidity pools',
      description: 'Find liquidity pools across multiple chains and protocols with advanced filtering and sorting.',
    }),

    ApiBody({
      type: SearchLiquidityPoolsRequestParams,
      description: 'Search criteria and pagination config.',
    }),

    ApiSuccessResponse(SearchLiquidityPoolsResponse, {
      description: 'Successfully retrieved a list of matching liquidity pools.',
    }),

    ApiBadRequestResponse({
      description: 'One or more search parameters are invalid.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ErrorResponse) },
          example: ErrorResponse.from(
            new InvalidBlockchainAddressError({
              blockchainAddress: new BlockchainAddress(Network.ETHEREUM, '0xbad-address'),
              property: 'tokensA',
            }),
            '/pools/search',
          ),
        },
      },
    }),
  );
}
