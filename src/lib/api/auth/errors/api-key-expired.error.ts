import { ApiErrorCode } from '@lib/api/error/error-codes/api-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyExpiredError extends BaseApiError {
  constructor() {
    super({
      details:
        'The provided API key exists, but it has expired. Verify your payment status in the dashboard or contact support for assistance.',
      errorCode: ApiErrorCode.API_KEY_EXPIRED,
      message: 'The passed API Key has expired.',
      metadata: {},
    });
  }
}
