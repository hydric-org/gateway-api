import { ApiKeyUnknownMetadata } from '@lib/api/error/dtos/metadata/api-key-unknown-metadata.dto';
import { AuthErrorCode } from '@lib/api/error/error-codes/auth-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyUnknownError extends BaseApiError<ApiKeyUnknownMetadata> {
  constructor(params?: { details?: string }) {
    super({
      details:
        'Some unknown error happened while validating your API Key. Please try again later or contact support for assistance.',
      errorCode: AuthErrorCode.API_KEY_INVALID,
      metadata: { details: params?.details },
      message: 'Could not validate your API Key.',
    });
  }
}
