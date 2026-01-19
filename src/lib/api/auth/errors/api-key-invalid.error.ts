import { AuthErrorCode } from '@lib/api/error/error-codes/auth-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyInvalidError extends BaseApiError {
  constructor() {
    super({
      details: 'The provided Authorization header is malformed. Expected format: "Bearer <token>".',
      errorCode: AuthErrorCode.API_KEY_INVALID,
      metadata: {},
      message: 'Invalid API Key format.',
    });
  }
}
