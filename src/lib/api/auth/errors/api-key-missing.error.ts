import { AuthErrorCode } from '@lib/api/error/error-codes/auth-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyMissingError extends BaseApiError {
  constructor() {
    super({
      details: 'The request lacks an API key. Please provide one in the Authorization header using the Bearer scheme.',
      errorCode: AuthErrorCode.API_KEY_MISSING,
      metadata: {
        example: 'Bearer <api-key>',
      },
      message: 'API Key is missing.',
    });
  }
}
