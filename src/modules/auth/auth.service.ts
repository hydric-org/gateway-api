import { IAPIKey } from '@core/interfaces/auth/api-key.interface';
import { ApiKeyClient } from '@infrastructure/auth/clients/api-key.client';
import { ApiKeyStatus } from '@lib/api/auth/api-key-status';
import { EnvKey } from '@lib/app/env-key.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { LRUCache } from 'lru-cache';

@Injectable()
export class AuthService {
  private readonly keyCache: LRUCache<string, IAPIKey>;
  private readonly notFoundCache: LRUCache<string, IAPIKey>;
  private readonly inflightRequests = new Map<string, Promise<IAPIKey>>();

  constructor(
    private readonly apiKeyClient: ApiKeyClient,
    private readonly configService: ConfigService,
  ) {
    const validTtl = this.configService.get<number>(EnvKey.AUTH_CACHE_TTL, 300) * 1000;

    this.keyCache = new LRUCache({
      max: 10000,
      ttl: validTtl,
    });

    this.notFoundCache = new LRUCache({
      max: 2000,
      ttl: 1800 * 1000, // 30 minutes for not found keys
    });
  }

  async getApiKeyData(key: string): Promise<IAPIKey> {
    const hashedKey = this.hashKey(key);

    const cached = this.keyCache.get(hashedKey) || this.notFoundCache.get(hashedKey);
    if (cached) return cached;

    const inflight = this.inflightRequests.get(hashedKey);
    if (inflight) return inflight;

    const request = this.fetchAndCacheKeyData(key, hashedKey);
    this.inflightRequests.set(hashedKey, request);

    try {
      return await request;
    } finally {
      this.inflightRequests.delete(hashedKey);
    }
  }

  private async fetchAndCacheKeyData(key: string, hashedKey: string): Promise<IAPIKey> {
    try {
      const data = await this.apiKeyClient.getApiKeyData(key);

      if (data.status === ApiKeyStatus.NOT_FOUND) {
        this.notFoundCache.set(hashedKey, data);
      } else if (data.status !== ApiKeyStatus.UNKNOWN) {
        this.keyCache.set(hashedKey, data);
      }

      return data;
    } catch (error) {
      return { status: ApiKeyStatus.UNKNOWN };
    }
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}
