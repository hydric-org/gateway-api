import { ErrorResponse } from '@lib/api/error/dtos/error-response.dto';
import { GenericValidationError } from '@lib/api/error/errors/generic-validation.error';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SearchMultichainTokensResponse } from '../dtos/response/search-multichain-tokens-response.dto';

export function ApiSearchMultichainTokensDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search for multi-chain assets',
      description: 'Searches for assets across all supported blockchains by keyword (name or symbol).',
    }),
    ApiOkResponse({
      description: 'The search results were successfully retrieved.',
      type: SearchMultichainTokensResponse,
    }),
    ApiBadRequestResponse({
      description: 'Validation failed for search query or filtering parameters.',
      example: ErrorResponse.from(
        new GenericValidationError({
          validationErrorDescription: 'search must not be empty',
          meta: {
            property: 'search',
            value: '',
          },
        }),
        '/tokens/search',
      ),
    }),
  );
}
