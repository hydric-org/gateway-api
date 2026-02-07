import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { GenericValidationError } from '@lib/api/error/errors/generic-validation.error';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SearchSingleChainTokensResponse } from '../dtos/response/search-single-chain-tokens-response.dto';

export function ApiSearchSingleChainTokensDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search for tokens on a specific blockchain',
      description: 'Searches for tokens on the specified blockchain network by keyword (name or symbol).',
    }),
    ApiOkResponse({
      description: 'The search results were successfully retrieved.',
      type: SearchSingleChainTokensResponse,
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
      examples: {
        emptySearch: {
          summary: 'Empty search query',
          value: ErrorResponse.from(
            new GenericValidationError({
              validationErrorDescription: 'search must not be empty',
              meta: {
                property: 'search',
                value: 123,
                constraints: { isString: ['search must be a string'] },
              },
            }),
            '/tokens/143/search',
          ),
        },
        unsupportedChainId: {
          summary: 'Unsupported chain ID',
          value: ErrorResponse.from(
            new UnsupportedChainIdError({
              chainId: 999999,
            }),
            '/tokens/999999/search',
          ),
        },
      },
    }),
  );
}
