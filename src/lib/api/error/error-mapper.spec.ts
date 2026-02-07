import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitErrorCode } from './error-codes/api-error-codes';
import { ErrorMapper } from './error-mapper';
import { RateLimitExceededError } from './errors/rate-limit-exceeded.error';

describe('ErrorMapper', () => {
  const createMockRequest = (originalUrl = '/pools'): Request =>
    ({
      originalUrl,
      method: 'GET',
      headers: {},
      body: {},
    }) as unknown as Request;

  describe('RateLimitExceededError mapping', () => {
    it('should return HTTP 429 Too Many Requests status code', () => {
      const error = new RateLimitExceededError(60);
      const request = createMockRequest('/pools');

      const result = ErrorMapper.map(error, request, 'trace-123');

      expect(result.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it('should set correct error code', () => {
      const error = new RateLimitExceededError(30);
      const request = createMockRequest();

      const result = ErrorMapper.map(error, request, 'trace-789');

      expect(result.error.code).toBe(RateLimitErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it('should set correct error title', () => {
      const error = new RateLimitExceededError(60);
      const request = createMockRequest();

      const result = ErrorMapper.map(error, request, 'trace-abc');

      expect(result.error.title).toBe('Rate Limit Exceeded');
    });

    it('should include descriptive message with retry time', () => {
      const error = new RateLimitExceededError(120);
      const request = createMockRequest();

      const result = ErrorMapper.map(error, request, 'trace-def');

      expect(result.error.message).toBe('Rate limit exceeded. Please retry after 120 seconds.');
    });

    it('should include traceId from request', () => {
      const error = new RateLimitExceededError(60);
      const request = createMockRequest();
      const traceId = 'custom-trace-id';

      const result = ErrorMapper.map(error, request, traceId);

      expect(result.traceId).toBe(traceId);
    });

    it('should include request path', () => {
      const error = new RateLimitExceededError(60);
      const request = createMockRequest('/pools/search');

      const result = ErrorMapper.map(error, request, 'trace-123');

      expect(result.path).toBe('/pools/search');
    });

    it('should include timestamp in ISO format', () => {
      const error = new RateLimitExceededError(60);
      const request = createMockRequest();

      const result = ErrorMapper.map(error, request, 'trace-123');

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include retryAfterSeconds in metadata', () => {
      const error = new RateLimitExceededError(90);
      const request = createMockRequest();

      const result = ErrorMapper.map(error, request, 'trace-123');

      expect(result.error.metadata).toEqual({
        retryAfterSeconds: 90,
      });
    });

    it('should include details about the rate limit', () => {
      const error = new RateLimitExceededError(60);
      const request = createMockRequest();

      const result = ErrorMapper.map(error, request, 'trace-123');

      expect(result.error.details).toContain('exceeded the maximum number of requests');
      expect(result.error.details).toContain('60 seconds');
    });
  });
});
