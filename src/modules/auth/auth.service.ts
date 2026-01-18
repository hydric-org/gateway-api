import { ApiKeyClient } from '@infrastructure/auth/clients/api-key.client';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ApiKeyClient)
    private readonly apiKeyClient: ApiKeyClient,
  ) {}

  async getApiKeyData(key: string) {
    return this.apiKeyClient.getApiKeyData(key);
  }
}
