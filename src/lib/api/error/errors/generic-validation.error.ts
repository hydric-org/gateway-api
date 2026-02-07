import { ValidationErrorMetadata } from '../dtos/metadata/validation-error-metadata.dto';
import { ValidationErrorCode } from '../error-codes/validation-error-codes';
import { BaseApiError } from './base-api-error';

export class GenericValidationError extends BaseApiError<ValidationErrorMetadata> {
  constructor(params: { validationErrorDescription: string; meta: ValidationErrorMetadata }) {
    super({
      message: params.validationErrorDescription,
      errorCode: ValidationErrorCode.VALIDATION_ERROR,
      details: "Check the 'meta' field for specific field-level violations.",
      metadata: params.meta,
    });
  }
}
