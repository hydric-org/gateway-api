import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { ILiquidityPoolsIndexerTokenForMultichainAggregation } from '@core/interfaces/token/liquidity-pools-indexer-token-for-multichain-aggregation.interface';
import { MULTICHAIN_TOKEN_OVERRIDES } from '@core/token/multichain-token-overrides';
import 'src/core/extensions/string.extension';
import { LiquidityPoolsIndexerResponseAdapter } from './liquidity-pools-indexer-response-adapter';

// No mock needed for multichain-token-overrides as we need the logic and can mutate the constant object.

describe('LiquidityPoolsIndexerResponseAdapter', () => {
  describe('indexerTokensToMultichainTokenList', () => {
    const createMockToken = (
      overrides?: Partial<ILiquidityPoolsIndexerTokenForMultichainAggregation>,
    ): ILiquidityPoolsIndexerTokenForMultichainAggregation => ({
      id: '1-0x123',
      address: '0x123',
      chainId: 1,
      name: 'Test Token',
      symbol: 'TEST',
      normalizedName: 'TEST TOKEN',
      normalizedSymbol: 'TEST',
      trackedTotalValuePooledUsd: 100000,
      trackedUsdPrice: 1.0,
      ...overrides,
    });

    const defaultParams = {
      matchAllSymbols: false,
      minimumSwapVolumeUsd: 0,
      minimumSwapsCount: 0,
      order: {
        field: TokenOrderField.TVL,
        direction: OrderDirection.DESC,
      },
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
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });
      const token2 = createMockToken({
        id: '8453-0x456',
        address: '0x456',
        chainId: 8453,
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [token1, token2],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      const addresses = result.multichainTokenList[0].addresses;
      expect(addresses).toHaveLength(2);
      expect(addresses).toEqual(
        expect.arrayContaining([
          { chainId: token1.chainId, address: token1.address },
          { chainId: token2.chainId, address: token2.address },
        ]),
      );
      expect(result.discardedTokens).toHaveLength(0);
    });

    it('should NOT group tokens with same symbol but different price (Standard Behavior)', () => {
      const token1 = createMockToken({
        id: '1-0xA',
        address: '0xA',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });
      const token2 = createMockToken({
        id: '1-0xB',
        address: '0xB',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 0.5, // 50% diff, exceed 20%
      });

      const token2Fixed = { ...token2, chainId: ChainId.BASE, id: '8453-0xB', address: '0xB' };

      const resultFixed = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [token1, token2Fixed],
        defaultParams,
      );

      expect(resultFixed.multichainTokenList.length).toBeGreaterThanOrEqual(1);
      const groupAll = resultFixed.multichainTokenList.find(
        (g) =>
          g.addresses.some((a) => a.address === token1.address && a.chainId === token1.chainId) &&
          g.addresses.some((a) => a.address === token2Fixed.address && a.chainId === token2Fixed.chainId),
      );
      expect(groupAll).toBeUndefined();
    });

    it('should FORCE JOIN tokens via override even if symbols differ', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        address: '0xA',
        normalizedSymbol: 'TOKEN_A',
      });
      const tokenB = createMockToken({
        id: '1-0xB',
        address: '0xB',
        normalizedSymbol: 'TOKEN_B',
      });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      const group = result.multichainTokenList[0];
      expect(group.addresses).toEqual(
        expect.arrayContaining([
          { chainId: tokenA.chainId, address: tokenA.address },
          { chainId: tokenB.chainId, address: tokenB.address },
        ]),
      );
    });

    it('should FORCE JOIN tokens via override even if prices differ', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        address: '0xA',
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 1.0,
      });
      const tokenB = createMockToken({
        id: '8453-0xB',
        address: '0xB',
        chainId: 8453,
        normalizedSymbol: 'USDC',
        trackedUsdPrice: 0.1, // 90% diff
      });

      // Override forcing Token B to be part of Token A despite price discrepancy
      MULTICHAIN_TOKEN_OVERRIDES['8453-0xB'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].addresses).toEqual(
        expect.arrayContaining([
          { chainId: tokenA.chainId, address: tokenA.address },
          { chainId: tokenB.chainId, address: tokenB.address },
        ]),
      );
    });

    it('should DISCARD token if partOf is NULL', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        address: '0xA',
        normalizedSymbol: 'USDC',
      });
      const tokenB = createMockToken({
        id: '1-0xB',
        address: '0xB',
        chainId: 8453,
        normalizedSymbol: 'USDC',
      });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: null };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].addresses).toEqual([{ chainId: tokenA.chainId, address: tokenA.address }]);
      expect(result.discardedTokens).toContainEqual(tokenB);

      const allGroupedAddresses = result.multichainTokenList.flatMap((g) => g.addresses);
      expect(allGroupedAddresses).not.toContainEqual({ chainId: tokenB.chainId, address: tokenB.address });
    });

    it('should CREATE NEW group if partOf points to self (Isolation)', () => {
      const tokenA = createMockToken({
        id: '1-0xA',
        address: '0xA',
        normalizedSymbol: 'USDC',
      });
      const tokenB = createMockToken({
        id: '8453-0xB',
        address: '0xB',
        chainId: 8453,
        normalizedSymbol: 'USDC',
      });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xA'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenA, tokenB],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(2);

      const groupA = result.multichainTokenList.find((g) =>
        g.addresses.some((a) => a.address === tokenA.address && a.chainId === tokenA.chainId),
      );
      const groupB = result.multichainTokenList.find((g) =>
        g.addresses.some((a) => a.address === tokenB.address && a.chainId === tokenB.chainId),
      );

      expect(groupA).toBeDefined();
      expect(groupB).toBeDefined();
      expect(groupA?.addresses).toEqual([{ chainId: tokenA.chainId, address: tokenA.address }]);
      expect(groupB?.addresses).toEqual([{ chainId: tokenB.chainId, address: tokenB.address }]);
    });

    it('should MERGE multiple override tokens into the same group', () => {
      const tokenA = createMockToken({ id: '1-0xA', address: '0xA', normalizedSymbol: 'A' });
      const tokenB = createMockToken({ id: '1-0xB', address: '0xB', normalizedSymbol: 'B' });
      const tokenC = createMockToken({ id: '1-0xC', address: '0xC', normalizedSymbol: 'C' });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: ['1-0xA'] };
      MULTICHAIN_TOKEN_OVERRIDES['1-0xC'] = { partOf: ['1-0xA'] };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenA, tokenB, tokenC],
        defaultParams,
      );

      expect(result.multichainTokenList).toHaveLength(1);
      expect(result.multichainTokenList[0].addresses).toEqual(
        expect.arrayContaining([
          { chainId: tokenA.chainId, address: tokenA.address },
          { chainId: tokenB.chainId, address: tokenB.address },
          { chainId: tokenC.chainId, address: tokenC.address },
        ]),
      );
    });

    it('should handle complex chain: A joins B, B joins C (Transitiveness)', () => {
      const tokenA = createMockToken({ id: '1-0xA', address: '0xA', normalizedSymbol: 'A' });
      const tokenB = createMockToken({ id: '1-0xB', address: '0xB', normalizedSymbol: 'B' });
      const tokenC = createMockToken({ id: '1-0xC', address: '0xC', normalizedSymbol: 'C' });

      MULTICHAIN_TOKEN_OVERRIDES['1-0xA'] = { partOf: ['1-0xB'] };
      MULTICHAIN_TOKEN_OVERRIDES['1-0xB'] = { partOf: ['1-0xC'] };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenA, tokenB, tokenC],
        defaultParams,
      );

      const groupWithA = result.multichainTokenList.find((g) =>
        g.addresses.some((a) => a.address === tokenA.address && a.chainId === tokenA.chainId),
      );
      const groupWithB = result.multichainTokenList.find((g) =>
        g.addresses.some((a) => a.address === tokenB.address && a.chainId === tokenB.chainId),
      );
      const groupWithC = result.multichainTokenList.find((g) =>
        g.addresses.some((a) => a.address === tokenC.address && a.chainId === tokenC.chainId),
      );

      expect(groupWithA).toBeDefined();
      expect(groupWithB).toBeDefined();
      expect(groupWithC).toBeDefined();
      expect(groupWithA).toBe(groupWithC);
    });

    it('should correctly sort multichain tokens by TVL DESC', () => {
      const tokenHighTvl = createMockToken({
        id: '1-0xHigh',
        address: '0xHigh',
        symbol: 'HIGH',
        normalizedSymbol: 'HIGH',
        trackedTotalValuePooledUsd: 1000000,
      });
      const tokenLowTvl = createMockToken({
        id: '1-0xLow',
        address: '0xLow',
        symbol: 'LOW',
        normalizedSymbol: 'LOW',
        trackedTotalValuePooledUsd: 100,
      });
      const tokenZeroTvl = createMockToken({
        id: '1-0xZero',
        address: '0xZero',
        symbol: 'ZERO',
        normalizedSymbol: 'ZERO',
        trackedTotalValuePooledUsd: 0,
      });

      const params = {
        ...defaultParams,
        order: {
          field: TokenOrderField.TVL,
          direction: OrderDirection.DESC,
        },
      };

      const result = LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
        [tokenZeroTvl, tokenHighTvl, tokenLowTvl],
        params,
      );

      expect(result.multichainTokenList).toHaveLength(3);
      expect(result.multichainTokenList[0].symbol).toBe('HIGH');
      expect(result.multichainTokenList[1].symbol).toBe('LOW');
      expect(result.multichainTokenList[2].symbol).toBe('ZERO');
    });
  });

  describe('responseToLiquidityPoolList', () => {
    const rawPool = {
      chainId: 1,
      poolAddress: '0xpool',
      poolType: LiquidityPoolType.V3,
      createdAtTimestamp: '123456789',
      currentFeeTierPercentage: '0.3',
      isDynamicFee: false,
      token0: {
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
      },
      token1: {
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
      protocol: {
        id: 'uniswap-v3',
        logo: 'https://example.com/logo.png',
        name: 'Uniswap V3',
        url: 'https://uniswap.org',
      },
      v3PoolData: {
        sqrtPriceX96: '123',
        tickSpacing: 60,
        tick: 1,
      },
      totalStats24h: {
        feesUsd: '0',
        swapVolumeUsd: '0',
        yearlyYield: '0',
        liquidityNetInflowUsd: '0',
        liquidityVolumeUsd: '0',
      },
      totalStats7d: {
        feesUsd: '0',
        swapVolumeUsd: '0',
        yearlyYield: '0',
        liquidityNetInflowUsd: '0',
        liquidityVolumeUsd: '0',
      },
      totalStats30d: {
        feesUsd: '0',
        swapVolumeUsd: '0',
        yearlyYield: '0',
        liquidityNetInflowUsd: '0',
        liquidityVolumeUsd: '0',
      },
      totalStats90d: {
        feesUsd: '0',
        swapVolumeUsd: '0',
        yearlyYield: '0',
        liquidityNetInflowUsd: '0',
        liquidityVolumeUsd: '0',
      },
      totalValueLockedUsd: '1000',
      totalValueLockedToken0: '1',
      totalValueLockedToken0Usd: '500',
      totalValueLockedToken1: '500',
      totalValueLockedToken1Usd: '500',
    };

    it('should NOT convert tokens when parseWrappedToNative is NOT called', () => {
      const result = LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList([rawPool as any]);
      expect(result[0].tokens[0].address).toBe('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
      expect(result[0].tokens[0].symbol).toBe('WETH');
    });

    it('should convert wrapped native to native when parseWrappedToNative is called', () => {
      const pools = LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList([rawPool as any]);
      const result = LiquidityPoolsIndexerResponseAdapter.parseWrappedToNative(pools);

      expect(result[0].tokens[0].address).toBe(ZERO_ETHEREUM_ADDRESS);
      expect(result[0].tokens[0].symbol).toBe('ETH');
      expect(result[0].tokens[0].name).toBe('Ether');
    });

    it('should NOT convert other tokens', () => {
      const pools = LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList([rawPool as any]);
      const result = LiquidityPoolsIndexerResponseAdapter.parseWrappedToNative(pools);

      expect(result[0].tokens[1].address).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
      expect(result[0].tokens[1].symbol).toBe('USDC');
    });

    it('should convert tokens in balance field when parseWrappedToNative is called', () => {
      const pools = LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList([rawPool as any]);
      const result = LiquidityPoolsIndexerResponseAdapter.parseWrappedToNative(pools);

      expect(result[0].balance.tokens[0].token.address).toBe(ZERO_ETHEREUM_ADDRESS);
      expect(result[0].balance.tokens[0].token.symbol).toBe('ETH');
      expect(result[0].balance.tokens[1].token.address).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
    });
  });
});
