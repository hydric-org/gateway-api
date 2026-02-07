import { RateLimitExceededError } from '@lib/api/error/errors/rate-limit-exceeded.error';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Response } from 'express';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected override throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();

    const retryAfterSeconds = Math.ceil(throttlerLimitDetail.timeToBlockExpire / 1000);

    response.setHeader('Retry-After', retryAfterSeconds.toString());
    response.setHeader('X-RateLimit-Limit', throttlerLimitDetail.limit.toString());
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + retryAfterSeconds).toString());

    throw new RateLimitExceededError(retryAfterSeconds);
  }
}
