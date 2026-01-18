import { AuthErrorCode } from '@lib/api/error/error-codes/auth-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyDisabledError extends BaseApiError {
  constructor() {
    super({
      details: 'The provided API key exists, but it is disabled for some reason. Contact support for assistance.',
      errorCode: AuthErrorCode.API_KEY_DISABLED,
      metadata: {},
      message: 'The passed API Key is disabled.',
    });
  }
}
