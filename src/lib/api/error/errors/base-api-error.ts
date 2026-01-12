import { BaseError } from '@core/errors/base-core-error';
import { ApiErrorCode } from '../api-error-codes';

export class BaseApiError extends BaseError {
  constructor(
    public override readonly params: {
      message: string;
      errorCode: ApiErrorCode;
      details: string;
      meta: Record<string, any>;
    },
  ) {
    super(params);
  }
}
