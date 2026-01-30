import { ChainId } from '@core/enums/chain-id';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { LiquidityPoolsIndexerGetSingleChainTokensDocument } from 'src/gen/graphql.gen';
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

      const result = await client.getSingleChainTokens({
        chainIds: [ChainId.ETHEREUM],
      });

      // Verify request call
      expect(graphQLClientsMock.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
        }),
      );

      // Verify filtering: Only Token 1 should be returned
      expect(result).toHaveLength(1);
      expect(result[0].address).toBe('0x1');
    });
  });
});
