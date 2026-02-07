import { BaseError } from '@core/errors/base-core-error';
import { ErrorMetadata } from '../types/error-metadata.registry';

export interface BaseApiErrorParams<T extends ErrorMetadata = ErrorMetadata> {
  errorCode: string;
  message: string;
  details: string;
  metadata: T;
}

export class BaseApiError<T extends ErrorMetadata = ErrorMetadata> extends BaseError<T> {
  constructor(public override readonly params: BaseApiErrorParams<T>) {
    super(params);
  }
}
