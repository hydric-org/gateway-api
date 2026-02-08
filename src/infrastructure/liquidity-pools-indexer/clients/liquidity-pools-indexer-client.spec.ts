import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolOrderField } from '@core/enums/liquidity-pool/liquidity-pool-order-field';
import { LiquidityPoolStatsTimeframe } from '@core/enums/liquidity-pool/liquidity-pool-stats-timeframe';
import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { OrderDirection } from '@core/enums/order-direction';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import {
  LiquidityPoolsIndexerGetSingleChainTokensDocument,
  LiquidityPoolsIndexerGetTokenPriceDocument,
} from 'src/gen/graphql.gen';
import { LiquidityPoolsIndexerClient } from './liquidity-pools-indexer-client';

describe('LiquidityPoolsIndexerClient', () => {
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

      const result = await client.getSingleChainTokens({
        filter: {
          chainIds: [ChainId.ETHEREUM],
        },
      });
      expect(result[0].address).toBe('0x1');
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
  });
});
