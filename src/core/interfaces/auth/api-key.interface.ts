import { ApiKeyStatus } from '@lib/api/auth/api-key-status';

export interface IAPIKey {
  readonly status: ApiKeyStatus;
  readonly expiredAt?: number;
  readonly metadata?: Record<string, unknown>;
}
