import { RateLimitErrorCode } from '@lib/api/error/error-codes/api-error-codes';
import { RateLimitExceededError } from '@lib/api/error/errors/rate-limit-exceeded.error';
import { ExecutionContext } from '@nestjs/common';
import { ThrottlerLimitDetail } from '@nestjs/throttler';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;

  const createMockResponse = () => ({
    setHeader: jest.fn(),
  });

  const createMockContext = (response: ReturnType<typeof createMockResponse>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  const createThrottlerLimitDetail = (timeToBlockExpireInSeconds: number, limit: number): ThrottlerLimitDetail => ({
    timeToBlockExpire: timeToBlockExpireInSeconds,
    limit,
    ttl: 60, // 60 seconds
    key: 'test-key',
    tracker: 'test-tracker',
    totalHits: limit + 1,
    isBlocked: true,
    timeToExpire: timeToBlockExpireInSeconds,
  });

  beforeEach(() => {
    guard = new (class extends RateLimitGuard {
      constructor() {
        super({} as any, {} as any, {} as any);
      }

      public testThrowThrottlingException(
        context: ExecutionContext,
        throttlerLimitDetail: ThrottlerLimitDetail,
      ): Promise<void> {
        return this.throwThrottlingException(context, throttlerLimitDetail);
      }
    })();
  });

  describe('throwThrottlingException', () => {
    it('should set Retry-After header with seconds until rate limit reset', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(30, 100);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '30');
      }
    });

    it('should set X-RateLimit-Limit header with the configured limit', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(60, 5000);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5000');
      }
    });

    it('should set X-RateLimit-Remaining header to 0', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(60, 100);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
      }
    });

    it('should set X-RateLimit-Reset header with Unix timestamp', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const secondsToWait = 60;
      const throttlerDetail = createThrottlerLimitDetail(secondsToWait, 100);

      const beforeCall = Math.ceil(Date.now() / 1000 + secondsToWait);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch {
        const afterCall = Math.ceil(Date.now() / 1000 + secondsToWait);

        const resetCall = mockResponse.setHeader.mock.calls.find((call: string[]) => call[0] === 'X-RateLimit-Reset');
        expect(resetCall).toBeDefined();

        const resetValue = parseInt(resetCall![1]);
        expect(resetValue).toBeGreaterThanOrEqual(beforeCall);
        expect(resetValue).toBeLessThanOrEqual(afterCall);
      }
    });

    it('should throw RateLimitExceededError with correct retryAfterSeconds', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(45, 100);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitExceededError);
        expect((error as RateLimitExceededError).retryAfterSeconds).toBe(45);
      }
    });

    it('should include correct error code in the thrown error', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(30, 100);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitExceededError);
        expect((error as RateLimitExceededError).params.errorCode).toBe(RateLimitErrorCode.RATE_LIMIT_EXCEEDED);
      }
    });

    it('should include retryAfterSeconds in error metadata', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(120, 100);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitExceededError);
        expect((error as RateLimitExceededError).params.metadata).toEqual({
          retryAfterSeconds: 120,
        });
      }
    });

    it('should set all headers before throwing the error', () => {
      const mockResponse = createMockResponse();
      const mockContext = createMockContext(mockResponse);
      const throttlerDetail = createThrottlerLimitDetail(60, 100);

      try {
        (guard as any).testThrowThrottlingException(mockContext, throttlerDetail);
        fail('Expected RateLimitExceededError to be thrown');
      } catch {
        expect(mockResponse.setHeader).toHaveBeenCalledTimes(4);
      }
    });
  });
});
