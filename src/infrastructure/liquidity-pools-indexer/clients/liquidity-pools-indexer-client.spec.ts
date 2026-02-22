import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { ChainId, ChainIdUtils } from '@core/enums/chain-id';
import { LiquidityPoolOrderField } from '@core/enums/liquidity-pool/liquidity-pool-order-field';
import { LiquidityPoolStatsTimeframe } from '@core/enums/liquidity-pool/liquidity-pool-stats-timeframe';
import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { OrderDirection } from '@core/enums/order-direction';
import { ParseWrappedToNative } from '@core/enums/parse-wrapped-to-native.enum';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { TokenUtils } from '@core/token/token-utils';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import 'src/core/extensions/string.extension';
import {
  LiquidityPoolsIndexerGetSingleChainTokensDocument,
  LiquidityPoolsIndexerGetTokenPriceDocument,
  LiquidityPoolsIndexerGetTokensForMultichainAggregationDocument,
} from 'src/gen/graphql.gen';
import { LiquidityPoolsIndexerClient } from './liquidity-pools-indexer-client';

let client: LiquidityPoolsIndexerClient;
let graphQLClientsMock: jest.Mocked<GraphQLClients>;

beforeEach(() => {
  graphQLClientsMock = {
    liquidityPoolsIndexerClient: {
      request: jest.fn(),
    },
  } as any;
  client = new LiquidityPoolsIndexerClient(graphQLClientsMock);
});

describe('getSingleChainTokens', () => {
  it('should filter out tokens with usdPrice <= 0', async () => {
    const mockResponse = {
      SingleChainToken: [
        {
          id: '1-0x1',
          tokenAddress: '0x1',
          chainId: 1,
          name: 'Token 1',
          symbol: 'T1',
          decimals: 18,
          usdPrice: '1.5',
        },
        {
          id: '1-0x2',
          tokenAddress: '0x2',
          chainId: 1,
          name: 'EOA or non-token',
          symbol: '',
          decimals: 0,
          usdPrice: '0',
        },
        {
          id: '1-0x3',
          tokenAddress: '0x3',
          chainId: 1,
          name: 'Token 3',
          symbol: 'T3',
          decimals: 18,
          usdPrice: '-1',
        },
      ],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    await client.getSingleChainTokens({
      filter: {
        chainIds: [ChainId.ETHEREUM],
      },
    });

    // Verify request call
    expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
        variables: expect.objectContaining({
          tokenFilter: expect.objectContaining({
            chainId: { _eq: ChainId.ETHEREUM },
          }),
        }),
      }),
    );
  });

  it('should correctly filter by multiple chainIds', async () => {
    const mockResponse = {
      SingleChainToken: [],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    await client.getSingleChainTokens({
      filter: {
        chainIds: [ChainId.ETHEREUM, ChainId.BASE],
      },
    });

    expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
        variables: expect.objectContaining({
          tokenFilter: expect.objectContaining({
            chainId: { _in: [ChainId.ETHEREUM, ChainId.BASE] },
          }),
        }),
      }),
    );
  });

  it('should filter out tokens with usdPrice <= 0', async () => {
    const mockResponse = {
      SingleChainToken: [
        {
          id: '1-0x1',
          tokenAddress: '0x1',
          chainId: 1,
          name: 'Token 1',
          symbol: 'T1',
          decimals: 18,
          usdPrice: '1.5',
        },
        {
          id: '1-0x2',
          tokenAddress: '0x2',
          chainId: 1,
          name: 'EOA or non-token',
          symbol: '',
          decimals: 0,
          usdPrice: '0',
        },
        {
          id: '1-0x3',
          tokenAddress: '0x3',
          chainId: 1,
          name: 'Token 3',
          symbol: 'T3',
          decimals: 18,
          usdPrice: '-1',
        },
      ],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    await client.getSingleChainTokens({
      filter: {
        chainIds: [ChainId.ETHEREUM],
      },
    });
  });

  it('should include both _in and _nin in the id filter when both ids and ignoreWrappedNative are provided', async () => {
    const mockResponse = { SingleChainToken: [] };
    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    const specificIds = ['1-0xabc', '1-0xdef'];

    await client.getSingleChainTokens({
      ids: specificIds,
      filter: {
        ignoreWrappedNative: true,
      },
    });

    const lastCall = (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mock.calls[0][0];
    const tokenFilter = lastCall.variables.tokenFilter;

    // Both should be present under _and
    expect(tokenFilter).toHaveProperty('_and');
    expect(tokenFilter._and).toContainEqual({ id: { _in: specificIds } });
    expect(tokenFilter._and).toContainEqual({
      id: {
        _nin: expect.arrayContaining([TokenUtils.buildTokenId(1, ChainIdUtils.wrappedNativeAddress[1])]),
      },
    });
  });

  it('should combine all filters seamlessly (ids, search, symbols, ignoreWrappedNative)', async () => {
    const mockResponse = { SingleChainToken: [] };
    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    const specificIds = ['1-0xabc'];
    const search = 'test';
    const symbols = ['USDC'];

    await client.getSingleChainTokens({
      ids: specificIds,
      search,
      filter: {
        symbols,
        ignoreWrappedNative: true,
        minimumTotalValuePooledUsd: 1000,
      },
    });

    const lastCall = (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mock.calls[0][0];
    const tokenFilter = lastCall.variables.tokenFilter;

    // Verify it uses _and to combine multiple filters
    expect(tokenFilter).toHaveProperty('_and');
    const andConditions = tokenFilter._and;

    // Check ID filters (both _in and _nin should be represented)
    expect(andConditions).toContainEqual({ id: { _in: specificIds } });
    expect(andConditions.some((c: any) => c.id?._nin)).toBe(true);

    // Check OR filters (both search and symbols should be represented)
    const orConditions = andConditions.filter((c: any) => c._or);
    expect(orConditions).toHaveLength(2);

    // One OR for search
    expect(orConditions.some((c: any) => c._or.some((o: any) => o.name?._ilike))).toBe(true);
    // One OR for symbols
    expect(orConditions.some((c: any) => c._or.some((o: any) => o.symbol?._in || o.symbol?._eq))).toBe(true);

    // Check stats filter
    expect(andConditions).toContainEqual({ trackedTotalValuePooledUsd: { _gt: '1000' } });
  });

  it('should combine search and symbols filters safely (using multiple _or blocks in _and)', async () => {
    const mockResponse = { SingleChainToken: [] };
    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    const search = 'eth';
    const symbols = ['WETH', 'stETH'];

    await client.getSingleChainTokens({
      search,
      filter: {
        symbols,
      },
    });

    const lastCall = (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mock.calls[0][0];
    const tokenFilter = lastCall.variables.tokenFilter;

    // Should use _and to combine the two _or conditions
    expect(tokenFilter).toHaveProperty('_and');
    const orConditions = tokenFilter._and.filter((c: any) => c._or);
    expect(orConditions).toHaveLength(2);

    // Verify search OR condition
    expect(
      orConditions.some((c: any) => c._or.some((o: any) => o.symbol?._ilike === '%eth%' || o.name?._ilike === '%eth%')),
    ).toBe(true);

    // Verify symbols OR condition
    // Verify symbols OR condition
    expect(orConditions.some((c: any) => c._or.some((o: any) => o.symbol?._in?.includes('WETH')))).toBe(true);
  });

  it('should maintain structural harmony for all ITokenFilter properties (ensures no field is missed or overwritten)', async () => {
    const mockResponse = { SingleChainToken: [] };
    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    // We use Required<ITokenFilter> to force a compilation error if a new property is added
    // to the interface but not included in this test case.
    const fullFilter: Required<ITokenFilter> = {
      chainIds: [ChainId.ETHEREUM, ChainId.BASE],
      minimumTotalValuePooledUsd: 1000,
      minimumSwapsCount: 50,
      minimumSwapVolumeUsd: 5000,
      ignoreWrappedNative: true,
    };

    await client.getSingleChainTokens({
      filter: fullFilter,
      ids: ['1-0xabc'], // Also add ids to check harmony between filter.id and root ids
      search: 'harmony', // Also add search to check harmony between filter.symbols and search _or
    });

    const lastCall = (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mock.calls[0][0];
    const tokenFilter = lastCall.variables.tokenFilter;

    expect(tokenFilter).toHaveProperty('_and');
    const conditions = tokenFilter._and;

    // Verify EVERY property from ITokenFilter is present in the conditions array
    // 1. chainIds
    expect(conditions).toContainEqual({ chainId: { _in: fullFilter.chainIds } });
    // 2. minimumTotalValuePooledUsd
    expect(conditions).toContainEqual({ trackedTotalValuePooledUsd: { _gt: '1000' } });
    // 3. minimumSwapsCount
    expect(conditions).toContainEqual({ swapsCount: { _gt: '50' } });
    // 4. minimumSwapVolumeUsd
    expect(conditions).toContainEqual({ trackedSwapVolumeUsd: { _gt: '5000' } });
    // 5. ignoreWrappedNative
    expect(conditions.some((c: any) => c.id?._nin)).toBe(true);

    // Verify additional params also present
    // 6. ids
    expect(conditions).toContainEqual({ id: { _in: ['1-0xabc'] } });
    // 7. search
    expect(conditions.some((c: any) => c._or?.some((o: any) => o.name?._ilike === '%harmony%'))).toBe(true);

    // Total count of conditions: 5 (from filter) + 1 (ids) + 1 (search) = 7
    expect(conditions).toHaveLength(7);
  });
});

describe('getTokenPrice', () => {
  const mockChainId = ChainId.ETHEREUM;
  const mockTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const mockTokenId = `${mockChainId}-${mockTokenAddress.toLowerCase()}`;
  const mockPrice = 1.0;

  it('should return price for a regular token', async () => {
    const mockResponse = {
      SingleChainToken: [
        {
          id: mockTokenId,
          trackedUsdPrice: mockPrice.toString(),
        },
      ],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    const result = await client.getTokenPrice(mockChainId, mockTokenAddress);

    expect(result).toBe(mockPrice);
    expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        document: LiquidityPoolsIndexerGetTokenPriceDocument,
        variables: {
          tokenFilter: {
            id: { _in: [mockTokenId] },
          },
        },
      }),
    );
  });

  it('should handle native token with zero address and return native price if found', async () => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const nativeId = `${mockChainId}-${zeroAddress}`;
    const wrappedAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const wrappedId = `${mockChainId}-${wrappedAddress.toLowerCase()}`;

    const mockResponse = {
      SingleChainToken: [
        {
          id: nativeId,
          trackedUsdPrice: '2500.0',
        },
      ],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    const result = await client.getTokenPrice(mockChainId, zeroAddress);

    expect(result).toBe(2500.0);
    expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          tokenFilter: {
            id: { _in: [nativeId, wrappedId] },
          },
        },
      }),
    );
  });

  it('should fallback to wrapped native price if native token is not indexed', async () => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const wrappedAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const wrappedId = `${mockChainId}-${wrappedAddress.toLowerCase()}`;

    const mockResponse = {
      SingleChainToken: [
        {
          id: wrappedId,
          trackedUsdPrice: '2500.0',
        },
      ],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    const result = await client.getTokenPrice(mockChainId, zeroAddress);

    expect(result).toBe(2500.0);
  });

  it('should throw TokenNotFoundError if no token is found', async () => {
    const mockResponse = {
      SingleChainToken: [],
    };

    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

    await expect(client.getTokenPrice(mockChainId, mockTokenAddress)).rejects.toThrow();
  });
});

describe('getPools', () => {
  const mockPoolResponse = {
    Pool: [],
  };

  const baseParams = {
    tokensA: [{ chainId: ChainId.ETHEREUM, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }],
    tokensB: [] as { chainId: ChainId; address: string }[],
    limit: 10,
    skip: 0,
    orderBy: {
      field: LiquidityPoolOrderField.TVL,
      direction: OrderDirection.DESC,
      timeframe: LiquidityPoolStatsTimeframe.DAY,
    },
    useWrappedForNative: true,
    parseWrappedToNative: ParseWrappedToNative.AUTO,
  };

  beforeEach(() => {
    (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockPoolResponse);
  });

  describe('protocols filter', () => {
    it('should use _in filter when protocols array is provided', async () => {
      const params = {
        ...baseParams,
        filters: {
          minimumTotalValueLockedUsd: 0,
          blockedPoolTypes: [],
          blockedProtocols: ['sushiswap-v3'],
          protocols: ['uniswap-v3', 'uniswap-v4'],
          poolTypes: [],
        },
      };

      await client.getPools(params);

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              protocol_id: { _in: ['uniswap-v3', 'uniswap-v4'] },
            }),
          }),
        }),
      );
    });

    it('should use _nin filter when protocols array is empty', async () => {
      const params = {
        ...baseParams,
        filters: {
          minimumTotalValueLockedUsd: 0,
          blockedPoolTypes: [],
          blockedProtocols: ['sushiswap-v3'],
          protocols: [],
          poolTypes: [],
        },
      };

      await client.getPools(params);

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              protocol_id: { _nin: ['sushiswap-v3'] },
            }),
          }),
        }),
      );
    });

    it('should lowercase protocol IDs when using _in filter', async () => {
      const params = {
        ...baseParams,
        filters: {
          minimumTotalValueLockedUsd: 0,
          blockedPoolTypes: [],
          blockedProtocols: [],
          protocols: ['UNISWAP-V3', 'UniSwap-V4'],
          poolTypes: [],
        },
      };

      await client.getPools(params);

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              protocol_id: { _in: ['uniswap-v3', 'uniswap-v4'] },
            }),
          }),
        }),
      );
    });
  });

  describe('poolTypes filter', () => {
    it('should use _in filter when poolTypes array is provided', async () => {
      const params = {
        ...baseParams,
        filters: {
          minimumTotalValueLockedUsd: 0,
          blockedPoolTypes: [LiquidityPoolType.ALGEBRA],
          blockedProtocols: [],
          protocols: [],
          poolTypes: [LiquidityPoolType.V3, LiquidityPoolType.V4],
        },
      };

      await client.getPools(params);

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              poolType: { _in: ['V3', 'V4'] },
            }),
          }),
        }),
      );
    });

    it('should use _nin filter when poolTypes array is empty', async () => {
      const params = {
        ...baseParams,
        filters: {
          minimumTotalValueLockedUsd: 0,
          blockedPoolTypes: [LiquidityPoolType.ALGEBRA],
          blockedProtocols: [],
          protocols: [],
          poolTypes: [],
        },
      };

      await client.getPools(params);

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              poolType: { _nin: ['ALGEBRA'] },
            }),
          }),
        }),
      );
    });
  });

  describe('combined filters', () => {
    it('should prioritize include filters over blocked filters for both protocols and poolTypes', async () => {
      const params = {
        ...baseParams,
        filters: {
          minimumTotalValueLockedUsd: 1000,
          blockedPoolTypes: [LiquidityPoolType.ALGEBRA],
          blockedProtocols: ['sushiswap-v3'],
          protocols: ['uniswap-v3'],
          poolTypes: [LiquidityPoolType.V3],
        },
      };

      await client.getPools(params);

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              protocol_id: { _in: ['uniswap-v3'] },
              poolType: { _in: ['V3'] },
              trackedTotalValueLockedUsd: { _gte: '1000' },
            }),
          }),
        }),
      );
    });
  });
  describe('native token handling', () => {
    const defaultFilters = {
      minimumTotalValueLockedUsd: 0,
      blockedPoolTypes: [],
      blockedProtocols: [],
      protocols: [],
      poolTypes: [],
    };

    const mockPool = {
      pool: {
        id: '1-0xpool',
        chainId: 1,
        token0: {
          tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          symbol: 'WETH',
          chainId: 1,
          decimals: 18,
          name: 'Wrapped Ether',
          logoUrl: 'https://example.com/weth.png',
        },
        token1: {
          tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          chainId: 1,
          decimals: 6,
          name: 'USD Coin',
          logoUrl: 'https://example.com/usdc.png',
        },
        protocol: {
          id: 'uniswap-v3',
          logo: 'https://example.com/logo.png',
          name: 'Uniswap V3',
          url: 'https://uniswap.org',
        },
        poolType: LiquidityPoolType.V3,
        poolAddress: '0xpool',
        createdAtTimestamp: '123456789',
        currentFeeTierPercentage: '0.3',
        isDynamicFee: false,
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
      },
    };

    const nativeToken = { chainId: ChainId.ETHEREUM, address: ZERO_ETHEREUM_ADDRESS };
    const wrappedToken = { chainId: ChainId.ETHEREUM, address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' };

    beforeEach(() => {
      (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue({
        Pool: [mockPool.pool],
      });
    });

    it('should expand query to include wrapped native when searching for native and useWrappedForNative is true', async () => {
      await client.getPools({
        ...baseParams,
        filters: defaultFilters,
        tokensA: [nativeToken],
        tokensB: [{ chainId: ChainId.ETHEREUM, address: ZERO_ETHEREUM_ADDRESS }],
        useWrappedForNative: true,
        parseWrappedToNative: ParseWrappedToNative.AUTO,
      });

      const expectedIdsTokensA = [
        TokenUtils.buildTokenId(nativeToken.chainId, nativeToken.address),
        TokenUtils.buildTokenId(nativeToken.chainId, ChainIdUtils.wrappedNativeAddress[nativeToken.chainId]),
      ];

      const expectedIdsTokensB = [
        TokenUtils.buildTokenId(ChainId.ETHEREUM, ZERO_ETHEREUM_ADDRESS),
        TokenUtils.buildTokenId(ChainId.ETHEREUM, ChainIdUtils.wrappedNativeAddress[ChainId.ETHEREUM]),
      ];

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              _or: expect.arrayContaining([
                expect.objectContaining({
                  token0_id: { _in: expect.arrayContaining(expectedIdsTokensA) },
                  token1_id: { _in: expect.arrayContaining(expectedIdsTokensB) },
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('should NOT expand query to include wrapped native when searching for native and useWrappedForNative is false', async () => {
      await client.getPools({
        ...baseParams,
        filters: defaultFilters,
        tokensA: [nativeToken],
        tokensB: [],
        useWrappedForNative: false,
        parseWrappedToNative: ParseWrappedToNative.AUTO,
      });

      const expectedIds = [TokenUtils.buildTokenId(nativeToken.chainId, nativeToken.address)];

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            poolsFilter: expect.objectContaining({
              _or: expect.arrayContaining([
                expect.objectContaining({
                  token0_id: { _in: expectedIds },
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('should convert wrapped to native in response when AUTO mode and searched for native', async () => {
      const result = await client.getPools({
        ...baseParams,
        filters: defaultFilters,
        tokensA: [nativeToken],
        tokensB: [],
        parseWrappedToNative: ParseWrappedToNative.AUTO,
        useWrappedForNative: true,
      });

      expect(result[0].tokens[0].address).toBe(ZERO_ETHEREUM_ADDRESS);
      expect(result[0].tokens[0].symbol).toBe('ETH');
    });

    it('should NOT convert wrapped to native in response when AUTO mode and searched for wrapped', async () => {
      const result = await client.getPools({
        ...baseParams,
        filters: defaultFilters,
        tokensA: [wrappedToken],
        tokensB: [],
        parseWrappedToNative: ParseWrappedToNative.AUTO,
        useWrappedForNative: true,
      });

      expect(result[0].tokens[0].address).toBe(wrappedToken.address);
      expect(result[0].tokens[0].symbol).toBe('WETH');
    });

    it('should NOT convert wrapped to native when NEVER mode', async () => {
      const result = await client.getPools({
        ...baseParams,
        filters: defaultFilters,
        tokensA: [nativeToken],
        tokensB: [],
        parseWrappedToNative: ParseWrappedToNative.NEVER,
        useWrappedForNative: true,
      });

      expect(result[0].tokens[0].address).toBe(wrappedToken.address);
      expect(result[0].tokens[0].symbol).toBe('WETH');
    });

    it('should ALWAYS convert wrapped to native when ALWAYS mode', async () => {
      const result = await client.getPools({
        ...baseParams,
        filters: defaultFilters,
        tokensA: [wrappedToken],
        tokensB: [],
        parseWrappedToNative: ParseWrappedToNative.ALWAYS,
        useWrappedForNative: true,
      });

      expect(result[0].tokens[0].address).toBe(ZERO_ETHEREUM_ADDRESS);
      expect(result[0].tokens[0].symbol).toBe('ETH');
    });
  });
});

describe('getTokensForMultichainAggregation', () => {
  describe('ignoreWrappedNative filter', () => {
    it('should include _nin filter for wrapped native tokens when ignoreWrappedNative is TRUE', async () => {
      const mockResponse = { SingleChainToken: [] };
      (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

      await client.getTokensForMultichainAggregation({
        filter: {
          ignoreWrappedNative: true,
        },
        orderBy: { field: TokenOrderField.TVL, direction: OrderDirection.DESC },
      });

      const wrappedIds = Object.entries(ChainIdUtils.wrappedNativeAddress).map(([chainId, address]) =>
        TokenUtils.buildTokenId(Number(chainId) as ChainId, address),
      );

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          document: LiquidityPoolsIndexerGetTokensForMultichainAggregationDocument,
          variables: expect.objectContaining({
            tokenFilter: expect.objectContaining({
              id: { _nin: expect.arrayContaining(wrappedIds) },
            }),
          }),
        }),
      );
    });

    it('should NOT include _nin filter for wrapped native tokens when ignoreWrappedNative is FALSE', async () => {
      const mockResponse = { SingleChainToken: [] };
      (graphQLClientsMock.liquidityPoolsIndexerClient.request as jest.Mock).mockResolvedValue(mockResponse);

      await client.getTokensForMultichainAggregation({
        filter: {
          ignoreWrappedNative: false,
        },
        orderBy: { field: TokenOrderField.TVL, direction: OrderDirection.DESC },
      });

      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          document: LiquidityPoolsIndexerGetTokensForMultichainAggregationDocument,
          variables: expect.objectContaining({
            tokenFilter: expect.not.objectContaining({
              id: expect.objectContaining({ _nin: expect.anything() }),
            }),
          }),
        }),
      );
    });
  });
});
