import { RateLimitErrorCode } from '../error-codes/api-error-codes';
import { BaseApiError } from './base-api-error';

export class RateLimitExceededError extends BaseApiError {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super({
      message: `Rate limit exceeded. Please retry after ${retryAfterSeconds} seconds.`,
      errorCode: RateLimitErrorCode.RATE_LIMIT_EXCEEDED,
      details: `You have exceeded the maximum number of requests allowed within the time window. The rate limit will reset in ${retryAfterSeconds} seconds.`,
      metadata: {
        retryAfterSeconds,
      },
    });

    this.retryAfterSeconds = retryAfterSeconds;
  }
}
