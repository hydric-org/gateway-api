import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { GenericValidationError } from '@lib/api/error/errors/generic-validation.error';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetSingleChainTokenListPathParams } from '../dtos/request/get-single-chain-token-list-path-params.dto';
import { GetSingleChainTokenListResponse } from '../dtos/response/get-single-chain-token-list-response.dto';

export function ApiGetSingleChainTokenListDocs() {
  return applyDecorators(
    ApiExtraModels(GetSingleChainTokenListPathParams),
    ApiOperation({
      summary: 'Get a list of tokens on a specific blockchain',
      description: 'Returns a paginated list of tokens available on the specified blockchain network.',
    }),
    ApiOkResponse({
      description: 'The token list for the specified blockchain was successfully retrieved.',
      type: GetSingleChainTokenListResponse,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request parameters.',
      examples: {
        unsupportedChainId: {
          summary: 'Unsupported chain ID',
          value: ErrorResponse.from(
            new UnsupportedChainIdError({
              chainId: 999999,
            }),
            '/tokens/999999',
          ),
        },
        invalidLimit: {
          summary: 'Invalid limit parameter',
          value: ErrorResponse.from(
            new GenericValidationError({
              validationErrorDescription: 'limit must not be greater than 500',
              meta: {
                property: 'limit',
                value: 101,
                constraints: { max: ['limit must not be greater than 1000'] },
              },
            }),
            '/tokens/143',
          ),
        },
      },
    }),
  );
}
