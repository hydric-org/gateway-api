import { BaseError as BaseApiError } from '@core/errors/base-core-error';
import { ValidationErrorCode } from '../validation-error-codes';

export class InvalidPaginationCursorError extends BaseApiError {
  constructor(params: { cursor: string }) {
    super({
      message: 'The pagination cursor is invalid',
      errorCode: ValidationErrorCode.INVALID_PAGINATION_CURSOR,
      details:
        'Cursors are opaque, base64-encoded tokens. This error usually occurs due to manual string manipulation, URL-encoding issues, or using a stale cursor from a previous session. Do not modify the cursor value returned by the API. Pass it back exactly as received',
      metadata: {
        receivedCursor: params.cursor,
      },
    });
  }
}
