import { BasketTokensCacheService } from './basket-tokens-cache.service';

describe('BasketTokensCacheService', () => {
  let service: BasketTokensCacheService;

  beforeEach(() => {
    service = new BasketTokensCacheService();
  });

  describe('computeCacheKey', () => {
    it('should return consistent hash for same token IDs regardless of order', () => {
      const tokenIds1 = ['1-0xabc', '1-0xdef', '137-0x123'];
      const tokenIds2 = ['137-0x123', '1-0xdef', '1-0xabc'];

      const key1 = service.computeCacheKey(tokenIds1);
      const key2 = service.computeCacheKey(tokenIds2);

      expect(key1).toBe(key2);
    });

    it('should return different hashes for different token IDs', () => {
      const tokenIds1 = ['1-0xabc', '1-0xdef'];
      const tokenIds2 = ['1-0xabc', '1-0xghi'];

      const key1 = service.computeCacheKey(tokenIds1);
      const key2 = service.computeCacheKey(tokenIds2);

      expect(key1).not.toBe(key2);
    });

    it('should return a SHA-256 hash (64 hex characters)', () => {
      const tokenIds = ['1-0xabc'];
      const key = service.computeCacheKey(tokenIds);

      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('get and set', () => {
    it('should return undefined for non-existent key', () => {
      const result = service.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return cached tokens after set', () => {
      const mockTokens = [
        { chainId: 1, address: '0xabc', decimals: 18, name: 'Test', symbol: 'TST', logoUrl: 'url' },
      ] as any;

      service.set('testKey', mockTokens);
      const result = service.get('testKey');

      expect(result).toEqual(mockTokens);
    });

    it('should overwrite existing cache entry', () => {
      const mockTokens1 = [
        { chainId: 1, address: '0xabc', decimals: 18, name: 'Test1', symbol: 'TST1', logoUrl: 'url' },
      ] as any;
      const mockTokens2 = [
        { chainId: 1, address: '0xdef', decimals: 18, name: 'Test2', symbol: 'TST2', logoUrl: 'url' },
      ] as any;

      service.set('testKey', mockTokens1);
      service.set('testKey', mockTokens2);

      const result = service.get('testKey');
      expect(result).toEqual(mockTokens2);
    });
  });
});
