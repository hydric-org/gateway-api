import { ILiquidityPoolsIndexerSingleChainToken } from '@core/interfaces/token/liquidity-pools-indexer-single-chain-token.interface';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { LRUCache } from 'lru-cache';

@Injectable()
export class BasketTokensCacheService {
  private readonly tokensCache: LRUCache<string, ILiquidityPoolsIndexerSingleChainToken[]>;

  constructor() {
    this.tokensCache = new LRUCache({ max: 1000 });
  }

  computeCacheKey(tokenIds: string[]): string {
    const sortedIds = [...tokenIds].sort();
    const concatenated = sortedIds.join(',');
    return createHash('sha256').update(concatenated).digest('hex');
  }

  get(key: string): ILiquidityPoolsIndexerSingleChainToken[] | undefined {
    return this.tokensCache.get(key);
  }

  set(key: string, tokens: ILiquidityPoolsIndexerSingleChainToken[]): void {
    this.tokensCache.set(key, tokens);
  }
}
