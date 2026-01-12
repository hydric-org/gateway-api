import { IBaseError } from '@core/interfaces/error/base-error.interface';

export abstract class BaseError implements IBaseError {
  constructor(
    public readonly params: {
      message: string;
      errorCode: string;
      details: string;
      meta: Record<string, any>;
    },
  ) {
    this.message = params.message;
    this.errorCode = params.errorCode;
    this.details = params.details;
    this.meta = params.meta;
  }

  message: string;
  errorCode: string;
  details: string;
  meta: Record<string, any>;
}
