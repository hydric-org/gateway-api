import { IBaseError } from '@core/interfaces/error/base-error.interface';

export abstract class BaseError extends Error implements IBaseError {
  constructor(
    public readonly params: {
      message: string;
      errorCode: string;
      details: string;
      metadata: Record<string, any>;
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
  metadata: Record<string, any>;
}
