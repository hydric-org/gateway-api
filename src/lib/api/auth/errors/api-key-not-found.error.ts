import { ApiKeyNotFoundMetadata } from '@lib/api/error/dtos/metadata/api-key-not-found-metadata.dto';
import { ApiErrorCode } from '@lib/api/error/error-codes/api-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyNotFoundError extends BaseApiError<ApiKeyNotFoundMetadata> {
  constructor(params: { receivedKey: string }) {
    super({
      details: 'Verify that the API key is correct and passed correctly in the Authorization header.',
      errorCode: ApiErrorCode.API_KEY_NOT_FOUND,
      message: 'The provided API key does not exist.',
      metadata: { receivedKey: params.receivedKey },
    });
  }
}
