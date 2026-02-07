import { IBaseError } from '@core/interfaces/error/base-error.interface';

export abstract class BaseError<T = unknown> extends Error implements IBaseError<T> {
  constructor(
    public readonly params: {
      message: string;
      errorCode: string;
      details: string;
      metadata: T;
    },
  ) {
    super(params.message);
    this.errorCode = params.errorCode;
    this.details = params.details;
    this.metadata = params.metadata;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  errorCode: string;
  details: string;
  metadata: T;
}
