import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { SearchLiquidityPoolsCursor } from '@lib/api/liquidity-pool/search-liquidity-pools-cursor.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { PoolsService } from './pools.service';

describe('PoolsService', () => {
  let service: PoolsService;
  let indexerClient: LiquidityPoolsIndexerClient;
  let basketsClient: TokenBasketsClient;

  const mockBasketId = BasketId.USD_STABLECOINS;
  const mockTokens = [
    { chainId: ChainId.ETHEREUM, address: '0xeth' },
    { chainId: ChainId.BASE, address: '0xbase' },
  ];

  const mockConfiguration: ITokenBasketConfiguration = {
    id: mockBasketId,
    name: 'USD Stablecoins',
    description: 'Test',
    logoUrl: 'url',
    chainIds: [ChainId.ETHEREUM, ChainId.BASE],
    addresses: mockTokens,
  };

  const mockSearchFilters: ILiquidityPoolFilter = {
    minimumTotalValueLockedUsd: 0,
    blockedPoolTypes: [],
    blockedProtocols: [],
    protocols: [],
    poolTypes: [],
  };

  const mockSearchConfig: any = {
    limit: 10,
    cursor: null,
    orderBy: 'TVL_DESC',
    useWrappedForNative: true,
    parseWrappedToNative: 'NEVER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoolsService,
        {
          provide: LiquidityPoolsIndexerClient,
          useValue: {
            getPool: jest.fn(),
            getPools: jest.fn(),
          },
        },
        {
          provide: TokenBasketsClient,
          useValue: {
            getBaskets: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PoolsService>(PoolsService);
    indexerClient = module.get<LiquidityPoolsIndexerClient>(LiquidityPoolsIndexerClient);
    basketsClient = module.get<TokenBasketsClient>(TokenBasketsClient);

    jest.spyOn(SearchLiquidityPoolsCursor, 'decode').mockReturnValue({ skip: 0 } as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchPools', () => {
    it('should resolve baskets and call indexer with combined tokens', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockConfiguration]);
      jest.spyOn(indexerClient, 'getPools').mockResolvedValue([]);

      const tokensA = [new BlockchainAddress(ChainId.MONAD, '0xmonad')];
      const basketsA = [{ basketId: mockBasketId, chainIds: [ChainId.ETHEREUM] }];

      await service.searchPools({
        tokensA,
        tokensB: [],
        basketsA,
        basketsB: [],
        searchFilters: mockSearchFilters,
        searchConfig: mockSearchConfig,
      });

      expect(basketsClient.getBaskets).toHaveBeenCalledWith(undefined, [mockBasketId]);
      expect(indexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          tokensA: [expect.objectContaining({ address: '0xmonad' }), expect.objectContaining({ address: '0xeth' })],
          tokensB: [],
        }),
      );
    });

    it('should deduplicate basketIds across Side A and Side B when calling client', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockConfiguration]);
      jest.spyOn(indexerClient, 'getPools').mockResolvedValue([]);

      await service.searchPools({
        tokensA: [],
        tokensB: [],
        basketsA: [{ basketId: mockBasketId, chainIds: [ChainId.ETHEREUM] }],
        basketsB: [{ basketId: mockBasketId, chainIds: [ChainId.BASE] }],
        searchFilters: mockSearchFilters,
        searchConfig: mockSearchConfig,
      });

      // Should only call with ONE basket ID
      expect(basketsClient.getBaskets).toHaveBeenCalledTimes(1);
      expect(basketsClient.getBaskets).toHaveBeenCalledWith(undefined, [mockBasketId]);

      expect(indexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          tokensA: [expect.objectContaining({ address: '0xeth' })],
          tokensB: [expect.objectContaining({ address: '0xbase' })],
        }),
      );
    });

    it('should avoid calling getBaskets if no baskets are provided', async () => {
      jest.spyOn(indexerClient, 'getPools').mockResolvedValue([]);

      await service.searchPools({
        tokensA: [new BlockchainAddress(ChainId.ETHEREUM, '0x1')],
        tokensB: [new BlockchainAddress(ChainId.ETHEREUM, '0x2')],
        basketsA: [],
        basketsB: [],
        searchFilters: mockSearchFilters,
        searchConfig: mockSearchConfig,
      });

      expect(basketsClient.getBaskets).not.toHaveBeenCalled();
      expect(indexerClient.getPools).toHaveBeenCalled();
    });

    it('should return empty pools early if Side A is constrained but resolves to 0 tokens', async () => {
      // Empty config response (basket found but no matches for chain)
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([{ ...mockConfiguration, addresses: [] }]);

      const result = await service.searchPools({
        tokensA: [],
        tokensB: [new BlockchainAddress(ChainId.ETHEREUM, '0xany')],
        basketsA: [{ basketId: mockBasketId, chainIds: [ChainId.SCROLL] }],
        basketsB: [],
        searchFilters: mockSearchFilters,
        searchConfig: mockSearchConfig,
      });

      expect(result.pools).toEqual([]);
      expect(indexerClient.getPools).not.toHaveBeenCalled();
    });

    it('should NOT return empty pools if side is NOT constrained', async () => {
      jest.spyOn(indexerClient, 'getPools').mockResolvedValue([]);

      await service.searchPools({
        tokensA: [],
        tokensB: [new BlockchainAddress(ChainId.ETHEREUM, '0xany')],
        basketsA: [],
        basketsB: [],
        searchFilters: mockSearchFilters,
        searchConfig: mockSearchConfig,
      });

      // Side A is not constrained, so it should call indexer even if tokensA is empty
      expect(indexerClient.getPools).toHaveBeenCalled();
    });

    it('should filter basket tokens by chainId defined in the specific side request', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockConfiguration]);
      jest.spyOn(indexerClient, 'getPools').mockResolvedValue([]);

      await service.searchPools({
        tokensA: [],
        tokensB: [],
        basketsA: [{ basketId: mockBasketId, chainIds: [ChainId.ETHEREUM] }],
        basketsB: [{ basketId: mockBasketId, chainIds: [] }], // Should include ALL chains from configuration
        searchFilters: mockSearchFilters,
        searchConfig: mockSearchConfig,
      });

      expect(indexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          tokensA: [expect.objectContaining({ chainId: ChainId.ETHEREUM })],
          tokensB: expect.arrayContaining([
            expect.objectContaining({ chainId: ChainId.ETHEREUM }),
            expect.objectContaining({ chainId: ChainId.BASE }),
          ]),
        }),
      );
    });
  });
});
