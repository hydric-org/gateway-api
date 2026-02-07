/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiKeyStatus } from '@lib/api/auth/api-key-status';
import { ApiKeyDisabledError } from '@lib/api/auth/errors/api-key-disabled.error';
import { ApiKeyExpiredError } from '@lib/api/auth/errors/api-key-expired.error';
import { ApiKeyInvalidError } from '@lib/api/auth/errors/api-key-invalid.error';
import { ApiKeyMissingError } from '@lib/api/auth/errors/api-key-missing.error';
import { ApiKeyNotFoundError } from '@lib/api/auth/errors/api-key-not-found.error';
import { ApiKeyUnknownError } from '@lib/api/auth/errors/api-key-unknown.error';
import { DecoratorKey } from '@lib/api/common/decorator-key';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(DecoratorKey.PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new ApiKeyMissingError();

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ApiKeyInvalidError({ reason: 'Malformed Authorization header. Expected format: "Bearer <token>"' });
    }

    const apiKeyData = await this.authService.getApiKeyData(token);

    if (apiKeyData.status === ApiKeyStatus.DISABLED) throw new ApiKeyDisabledError();
    if (apiKeyData.status === ApiKeyStatus.EXPIRED) {
      throw new ApiKeyExpiredError({
        expiredAt: apiKeyData.expiredAt ? new Date(apiKeyData.expiredAt).toISOString() : 'unknown',
      });
    }
    if (apiKeyData.status === ApiKeyStatus.NOT_FOUND) throw new ApiKeyNotFoundError({ receivedKey: token });
    if (apiKeyData.status !== ApiKeyStatus.VALID) {
      throw new ApiKeyUnknownError({ details: `Status: ${apiKeyData.status}` });
    }

    return true;
  }
}
