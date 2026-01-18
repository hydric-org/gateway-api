import { IAPIKey } from '@core/interfaces/auth/api-key.interface';
import { EnvKey } from '@lib/app/env-key.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Unkey } from '@unkey/api';
import { UnkeyResponseAdapter } from '../adapters/unkey-response.adapter';

@Injectable()
export class ApiKeyClient {
  private readonly client: Unkey;

  constructor(private readonly configService: ConfigService) {
    const rootKey = this.configService.getOrThrow<string>(EnvKey.UNKEY_ROOT_KEY);
    this.client = new Unkey({ rootKey });
  }

  async getApiKeyData(key: string): Promise<IAPIKey> {
    const response = await this.client.keys.verifyKey({
      key,
    });

    return UnkeyResponseAdapter.verifyToApiKey(response);
  }
}
