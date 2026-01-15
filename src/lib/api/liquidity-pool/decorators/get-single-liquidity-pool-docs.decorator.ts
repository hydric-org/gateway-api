import { Network } from '@core/enums/network';
import { LiquidityPoolNotFoundError } from '@core/errors/liquidity-pool-not-found.error';
import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { LiquidityPool, V3LiquidityPoolExample, V4LiquidityPoolExample } from '../dtos/liquidity-pool.dto';
import { InvalidLiquidityPoolAddressError } from '../errors/invalid-liquidity-pool-address.error';

export function GetSingleLiquidityPoolDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get information about a single liquidity pool',
      description: 'Returns detailed information about a single liquidity pool by address and chain id',
    }),

    ApiOkResponse({
      description: 'The pool data was successfully retrieved.',
      examples: {
        V3: {
          summary: 'Liquidity pool with V3 metadata',
          value: V3LiquidityPoolExample,
        },
        V4: {
          summary: 'Liquidity pool with V4 metadata',
          value: V4LiquidityPoolExample,
        },
      },
      type: () => LiquidityPool,
    }),

    ApiBadRequestResponse({
      description: 'Validation failed.',
      type: ErrorResponse,
      examples: {
        'Invalid Address': {
          summary: 'Invalid Pool Address',
          value: ErrorResponse.from(
            new InvalidLiquidityPoolAddressError({ liquidityPoolAddress: '0x123' }),
            '/pools/0x123',
          ),
        },
        'Unsupported ChainId': {
          summary: 'Unsupported Chain ID',
          value: ErrorResponse.from(new UnsupportedChainIdError({ chainId: 2 }), '/pools/0x123'),
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Pool not found.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ErrorResponse) },
          example: ErrorResponse.from(
            new LiquidityPoolNotFoundError({ chainId: Network.BASE, poolAddress: '0x123' }),
            '/pools/0x123',
          ),
        },
      },
    }),
  );
}
