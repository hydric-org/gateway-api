import { AuthErrorCode } from '@lib/api/error/error-codes/auth-error-codes';
import { BaseApiError } from '@lib/api/error/errors/base-api-error';

export class ApiKeyUnknownError extends BaseApiError {
  constructor() {
    super({
      details:
        'Some unknown error happened while validating your API Key. Please try again later or contact support for assistance.',
      errorCode: AuthErrorCode.API_KEY_INVALID,
      metadata: {},
      message: 'Could not validate your API Key.',
    });
  }
}
