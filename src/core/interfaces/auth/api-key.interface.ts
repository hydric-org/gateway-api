import { ApiKeyStatus } from '@lib/api/auth/api-key-status';

export interface IAPIKey {
  readonly status: ApiKeyStatus;
}
