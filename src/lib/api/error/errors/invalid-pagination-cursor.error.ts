import { InvalidPaginationCursorMetadata } from '@lib/api/error/dtos/metadata/invalid-pagination-cursor-metadata.dto';
import { ValidationErrorCode } from '../error-codes/validation-error-codes';
import { BaseApiError } from './base-api-error';

export class InvalidPaginationCursorError extends BaseApiError<InvalidPaginationCursorMetadata> {
  constructor(params: { cursor: string }) {
    super({
      message: 'The pagination cursor is invalid',
      errorCode: ValidationErrorCode.INVALID_PAGINATION_CURSOR,
      details:
        'Cursors are opaque, zlib-compressed, base64url-encoded tokens. This error usually occurs due to manual string manipulation, URL-encoding issues, or using a stale cursor from a previous session. Do not modify the cursor value returned by the API. Pass it back exactly as received',
      metadata: {
        receivedCursor: params.cursor,
      },
    });
  }
}
