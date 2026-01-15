import { IBaseError } from '@core/interfaces/error/base-error.interface';

export abstract class BaseError implements IBaseError {
  constructor(
    public readonly params: {
      message: string;
      errorCode: string;
      details: string;
      metadata: Record<string, any>;
    },
  ) {
    this.message = params.message;
    this.errorCode = params.errorCode;
    this.details = params.details;
    this.metadata = params.metadata;
  }

  message: string;
  errorCode: string;
  details: string;
  metadata: Record<string, any>;
}
