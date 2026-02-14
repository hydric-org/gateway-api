import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;
  let liquidityPoolsIndexerMock: jest.Mocked<LiquidityPoolsIndexerClient>;

  beforeEach(() => {
    liquidityPoolsIndexerMock = {
      getTokensForMultichainAggregation: jest.fn(),
    } as any;
    service = new TokensService(liquidityPoolsIndexerMock);
  });

  describe('getMultichainTokens', () => {
    it('should use ceiling for batch size when limit is an odd number (e.g., 5 * 1.5 = 7.5 -> 8)', async () => {
      const limit = 5;
      const expectedBatchSize = 8; // Math.ceil(5 * 1.5)

      liquidityPoolsIndexerMock.getTokensForMultichainAggregation.mockResolvedValue([]);

      await service.searchMultichainTokens(
        'test',
        {
          limit,
          orderBy: { field: TokenOrderField.TVL, direction: OrderDirection.DESC },
          matchAllSymbols: false,
        },
        {
          minimumTotalValuePooledUsd: 0,
          minimumSwapsCount: 0,
          minimumSwapVolumeUsd: 0,
          ignoreWrappedNative: false,
        },
      );

      // Verify the first call to getTokensForMultichainAggregation
      expect(liquidityPoolsIndexerMock.getTokensForMultichainAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: expectedBatchSize,
        }),
      );
    });

    it('should use integer batch size when limit is an even number (e.g., 10 * 1.5 = 15)', async () => {
      const limit = 10;
      const expectedBatchSize = 15; // 10 * 1.5

      liquidityPoolsIndexerMock.getTokensForMultichainAggregation.mockResolvedValue([]);

      await service.searchMultichainTokens(
        'test',
        {
          limit,
          orderBy: { field: TokenOrderField.TVL, direction: OrderDirection.DESC },
          matchAllSymbols: false,
        },
        {
          minimumTotalValuePooledUsd: 0,
          minimumSwapsCount: 0,
          minimumSwapVolumeUsd: 0,
          ignoreWrappedNative: false,
        },
      );

      expect(liquidityPoolsIndexerMock.getTokensForMultichainAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: expectedBatchSize,
        }),
      );
    });
  });
});
