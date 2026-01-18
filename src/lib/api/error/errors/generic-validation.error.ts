import { BaseError } from '@core/errors/base-core-error';
import { ValidationErrorCode } from '../error-codes/validation-error-codes';

export class GenericValidationError extends BaseError {
  constructor(params: { validationErrorDescription: string; meta: Record<string, any> }) {
    super({
      message: params.validationErrorDescription,
      errorCode: ValidationErrorCode.VALIDATION_ERROR,
      details: "Check the 'meta' field for specific field-level violations.",
      metadata: params.meta,
    });
  }
}
