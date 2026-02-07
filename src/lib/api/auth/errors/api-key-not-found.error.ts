import { ApiKeyNotFoundMetadata } from '@lib/api/error/dtos/metadata/api-key-not-found-metadata.dto';
import { ApiErrorCode } from '@lib/api/error/error-codes/api-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyNotFoundError extends BaseApiError<ApiKeyNotFoundMetadata> {
  constructor(params: { receivedKey: string }) {
    const key = params.receivedKey;
    let maskedKey: string;

    if (key.length > 10) {
      maskedKey = `${key.slice(0, 4)}...${key.slice(-3)}`;
    } else if (key.length > 4) {
      maskedKey = `${key.slice(0, 1)}...${key.slice(-1)}`;
    } else {
      maskedKey = '***';
    }

    super({
      details: 'Verify that the API key is correct and passed correctly in the Authorization header.',
      errorCode: ApiErrorCode.API_KEY_NOT_FOUND,
      message: 'The provided API key does not exist.',
      metadata: { receivedKey: maskedKey },
    });
  }
}
