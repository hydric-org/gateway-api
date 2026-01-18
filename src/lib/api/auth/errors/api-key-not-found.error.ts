import { ApiErrorCode } from '@lib/api/error/error-codes/api-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyNotFoundError extends BaseApiError {
  constructor() {
    super({
      details: 'Verify that the API key is correct and passed correctly in the Authorization header.',
      errorCode: ApiErrorCode.API_KEY_NOT_FOUND,
      message: 'The provided API key does not exist.',
      metadata: {},
    });
  }
}
