import { RateLimitErrorCode } from '../error-codes/api-error-codes';
import { BaseApiError } from './base-api-error';
import { RateLimitExceededError } from './rate-limit-exceeded.error';

describe('RateLimitExceededError', () => {
  describe('constructor', () => {
    it('should be an instance of BaseApiError', () => {
      const error = new RateLimitExceededError(60);
      expect(error).toBeInstanceOf(BaseApiError);
    });

    it('should set retryAfterSeconds property', () => {
      const error = new RateLimitExceededError(45);
      expect(error.retryAfterSeconds).toBe(45);
    });

    it('should set correct error code', () => {
      const error = new RateLimitExceededError(30);
      expect(error.params.errorCode).toBe(RateLimitErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it('should include retryAfterSeconds in metadata', () => {
      const error = new RateLimitExceededError(120);
      expect(error.params.metadata).toEqual({
        retryAfterSeconds: 120,
      });
    });

    it('should construct meaningful error message with retry time', () => {
      const error = new RateLimitExceededError(60);
      expect(error.message).toBe('Rate limit exceeded. Please retry after 60 seconds.');
    });

    it('should construct meaningful details with retry time', () => {
      const error = new RateLimitExceededError(30);
      expect(error.params.details).toBe(
        'You have exceeded the maximum number of requests allowed within the time window. The rate limit will reset in 30 seconds.',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle 0 seconds retry', () => {
      const error = new RateLimitExceededError(0);
      expect(error.retryAfterSeconds).toBe(0);
      expect(error.message).toBe('Rate limit exceeded. Please retry after 0 seconds.');
    });

    it('should handle large retry values', () => {
      const error = new RateLimitExceededError(3600);
      expect(error.retryAfterSeconds).toBe(3600);
      expect(error.message).toBe('Rate limit exceeded. Please retry after 3600 seconds.');
    });

    it('should handle 1 second retry', () => {
      const error = new RateLimitExceededError(1);
      expect(error.retryAfterSeconds).toBe(1);
      expect(error.message).toBe('Rate limit exceeded. Please retry after 1 seconds.');
    });
  });
});
