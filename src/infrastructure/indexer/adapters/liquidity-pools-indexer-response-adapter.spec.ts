import { IIndexerToken } from '@core/interfaces/token/indexer-token.interface';
import { MULTICHAIN_TOKEN_OVERRIDES } from '@core/token/multichain-token-overrides';
import { LiquidityPoolsIndexerResponseAdapter } from './liquidity-pools-indexer-response-adapter';

// No mock needed for multichain-token-overrides as we need the logic and can mutate the constant object.

describe('LiquidityPoolsIndexerResponseAdapter', () => {
  describe('indexerTokensToMultichainTokenList', () => {
    const createMockToken = (overrides?: Partial<IIndexerToken>): IIndexerToken => ({
      id: '1-0x123',
      address: '0x123',
      chainId: 1,
      name: 'Test Token',
      symbol: 'TEST',
      normalizedName: 'TEST TOKEN',
      normalizedSymbol: 'TEST',
      decimals: 18,
      logoUrl: '',
      swapsCount: 100,
      trackedPriceBackingUsd: 100000,
      trackedSwapVolumeUsd: 100000,
      trackedTotalValuePooledUsd: 100000,
      trackedUsdPrice: 1.0,
      ...overrides,
    });

    const defaultParams = {
      matchAllSymbols: false,
      minimumPriceBackingUsd: 0,
      minimumSwapVolumeUsd: 0,
      minimumSwapsCount: 0,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      Object.keys(MULTICHAIN_TOKEN_OVERRIDES).forEach((key) => delete MULTICHAIN_TOKEN_OVERRIDES[key]);
    });

    it('should group tokens with same symbol and similar price (Standard Behavior)', () => {
      const token1 = createMockToken({
        id: '1-0x123',
        address: '0x123',
        chainId: 1,
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });
      const token2 = createMockToken({
        id: '8453-0x456',
        address: '0x456',
        chainId: 8453,
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [token1, token2],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].ids).toEqual(expect.arrayContaining([token1.id, token2.id]));
      expect(result.discardedTokens).toHaveLength(0);
    });

    it('should NOT group tokens with same symbol but different price (Standard Behavior)', () => {
      const token1 = createMockToken({
        id: '1-0xA',
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });
      const token2 = createMockToken({
        id: '1-0xB',
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 0.5, // 50% diff, exceed 20%
      });

      const token2Fixed = { ...token2, chainId: 8453, id: '8453-0xB' };

      const resultFixed = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [token1, token2Fixed],
        defaultParams,
      );

      expect(resultFixed.multichainTokenList.length).toBeGreaterThanOrEqual(1);
      const groupAll = resultFixed.multichainTokenList.find(
        (g) => g.ids.includes(token1.id) && g.ids.includes(token2Fixed.id),
      );
      expect(groupAll).toBeUndefined();
    });

    it('should FORCE JOIN tokens via override even if symbols differ', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        symbol: 'TOKEN_A',
        normalizedSymbol: 'TOKEN_A',
      });
      const tokenB = createMockToken({
        id: '1-0xB',
        symbol: 'TOKEN_B',
        normalizedSymbol: 'TOKEN_B',
      });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      const group = result.multichainTokenList[0];
      expect(group.ids).toContain(tokenA.id);
      expect(group.ids).toContain(tokenB.id);
    });

    it('should FORCE JOIN tokens via override even if prices differ', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });
      const tokenB = createMockToken({
        id: '8453-0xB',
        chainId: 8453,
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 0.1, // 90% diff
      });

      // Override forcing Token B to be part of Token A despite price discrepancy
      MULTICHAIN_TOKEN_OVERRIDES['8453-0xB'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].ids).toEqual(expect.arrayContaining([tokenA.id, tokenB.id]));
    });

    it('should DISCARD token if partOf is NULL', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
      });
      const tokenB = createMockToken({
        id: '1-0xB',
        chainId: 8453,
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
      });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: null };

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].ids).toEqual([tokenA.id]);
      expect(result.discardedTokens).toContainEqual(tokenB);

      const allGroupedIds = result.multichainTokenList.flatMap((g) => g.ids);
      expect(allGroupedIds).not.toContain(tokenB.id);
    });

    it('should CREATE NEW group if partOf points to self (Isolation)', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
      });
      const tokenB = createMockToken({
        id: '8453-0xB',
        chainId: 8453,
        symbol: 'USDC',
        normalizedSymbol: 'USDC',
      });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xA'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(2);

      const groupA = result.multichainTokenList.find((g) => g.ids.includes(tokenA.id));
      const groupB = result.multichainTokenList.find((g) => g.ids.includes(tokenB.id));

      expect(groupA).toBeDefined();
      expect(groupB).toBeDefined();
      expect(groupA?.ids).toEqual([tokenA.id]);
      expect(groupB?.ids).toEqual([tokenB.id]);
    });

    it('should MERGE multiple override tokens into the same group', () => {
      const tokenA = createMockToken({ id: '1-0xA', symbol: 'A', normalizedSymbol: 'A' });
      const tokenB = createMockToken({ id: '1-0xB', symbol: 'B', normalizedSymbol: 'B' });
      const tokenC = createMockToken({ id: '1-0xC', symbol: 'C', normalizedSymbol: 'C' });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: ['1-0xA'] };
      MULTICHAIN_TOKEN_OVERRIDES['1-0xC'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [tokenA, tokenB, tokenC],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].ids).toEqual(expect.arrayContaining([tokenA.id, tokenB.id, tokenC.id]));
    });

    it('should handle complex chain: A joins B, B joins C (Transitiveness)', () => {
      const tokenA = createMockToken({ id: '1-0xA', symbol: 'A', normalizedSymbol: 'A' });
      const tokenB = createMockToken({ id: '1-0xB', symbol: 'B', normalizedSymbol: 'B' });
      const tokenC = createMockToken({ id: '1-0xC', symbol: 'C', normalizedSymbol: 'C' });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xA'] = { partOf: ['1-0xB'] };
      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: ['1-0xC'] };

      const result = LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(
        [tokenA, tokenB, tokenC],
        defaultParams,
      );

      const groupWithA = result.multichainTokenList.find((g) => g.ids.includes(tokenA.id));
      const groupWithB = result.multichainTokenList.find((g) => g.ids.includes(tokenB.id));
      const groupWithC = result.multichainTokenList.find((g) => g.ids.includes(tokenC.id));

      expect(groupWithA).toBeDefined();
      expect(groupWithB).toBeDefined();
      expect(groupWithC).toBeDefined();
      expect(groupWithA).toBe(groupWithC);
    });
  });
});
