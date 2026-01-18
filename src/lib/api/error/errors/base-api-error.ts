import { BaseError } from '@core/errors/base-core-error';
import { ApiErrorCode } from '../error-codes/api-error-codes';

export class BaseApiError extends BaseError {
  constructor(
    public override readonly params: {
      message: string;
      errorCode: ApiErrorCode;
      details: string;
      metadata: Record<string, any>;
    },
  ) {
    super(params);
  }
}
