import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { MultiChainTokenBasketNotFoundError } from '@core/errors/multi-chain-token-basket-not-found.error';
import { SingleChainTokenBasketNotFoundError } from '@core/errors/single-chain-token-basket-not-found.error';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Test, TestingModule } from '@nestjs/testing';
import { BasketTokensCacheService } from './basket-tokens-cache.service';
import { TokensBasketsService } from './tokens-baskets.service';

describe('TokensBasketsService', () => {
  let service: TokensBasketsService;
  let basketsClient: TokenBasketsClient;
  let indexerClient: LiquidityPoolsIndexerClient;
  let cacheService: BasketTokensCacheService;

  // Mock Data
  const mockBasketId = BasketId.USD_STABLECOINS;
  const mockChainId = ChainId.ETHEREUM;

  const mockBasket: ITokenBasketConfiguration = {
    id: mockBasketId,
    name: 'USD Stablecoins',
    description: 'Test',
    logoUrl: 'url',
    chainIds: [mockChainId],
    addresses: [{ chainId: mockChainId, address: '0xtoken' }],
  };

  const mockIndexerToken: any = {
    chainId: mockChainId,
    address: '0xtoken',
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
    logoUrl: 'logo',
    totalValuePooledUsd: 1000,
  };

  const expectedToken: ISingleChainTokenMetadata = {
    chainId: mockChainId,
    address: '0xtoken',
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
    logoUrl: TOKEN_LOGO(mockChainId, '0xtoken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensBasketsService,
        {
          provide: TokenBasketsClient,
          useValue: {
            getBasket: jest.fn(),
            getSingleChainBasket: jest.fn(),
            getBaskets: jest.fn(),
          },
        },
        {
          provide: LiquidityPoolsIndexerClient,
          useValue: {
            getSingleChainTokens: jest.fn(),
          },
        },
        {
          provide: BasketTokensCacheService,
          useValue: {
            computeCacheKey: jest.fn().mockReturnValue('mock-cache-key'),
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokensBasketsService>(TokensBasketsService);
    basketsClient = module.get<TokenBasketsClient>(TokenBasketsClient);
    indexerClient = module.get<LiquidityPoolsIndexerClient>(LiquidityPoolsIndexerClient);
    cacheService = module.get<BasketTokensCacheService>(BasketTokensCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBaskets', () => {
    it('should return all valid hydrated baskets', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getBaskets();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tokens).toHaveLength(1);
      expect(result[0].tokens[0]).toEqual(expectedToken);
    });

    it('should return empty array if no baskets found', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([]);

      const result = await service.getBaskets();
      expect(result).toEqual([]);
    });

    it('should filter baskets by chainIds when provided', async () => {
      const multiChainBasket: ITokenBasketConfiguration = {
        ...mockBasket,
        chainIds: [ChainId.ETHEREUM, ChainId.MONAD],
        addresses: [
          { chainId: ChainId.ETHEREUM, address: '0xeth' },
          { chainId: ChainId.MONAD, address: '0xmonad' },
        ],
      };
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([
        {
          ...multiChainBasket,
          chainIds: [ChainId.MONAD],
          addresses: [{ chainId: ChainId.MONAD, address: '0xmonad' }],
        },
      ]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([]);

      const result = await service.getBaskets([ChainId.MONAD]);

      expect(result).toHaveLength(1);
      expect(result[0].chainIds).toEqual([ChainId.MONAD]);
    });

    it('should return empty list if all baskets are filtered out by chainIds', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([]);
      const result = await service.getBaskets([ChainId.MONAD]);
      expect(result).toEqual([]);
    });

    it('should pass basketIds to client when provided', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      await service.getBaskets(undefined, [BasketId.USD_STABLECOINS]);

      expect(basketsClient.getBaskets).toHaveBeenCalledWith(undefined, [BasketId.USD_STABLECOINS]);
    });

    it('should pass both chainIds and basketIds to client when both provided', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      await service.getBaskets([ChainId.ETHEREUM], [BasketId.USD_STABLECOINS]);

      expect(basketsClient.getBaskets).toHaveBeenCalledWith([ChainId.ETHEREUM], [BasketId.USD_STABLECOINS]);
    });

    it('should return only requested baskets when basketIds is provided', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getBaskets(undefined, [BasketId.USD_STABLECOINS]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(BasketId.USD_STABLECOINS);
    });
  });

  describe('getSingleBasketInMultipleChains', () => {
    it('should return basket across available networks', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(mockBasket);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleBasketInMultipleChains(mockBasketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBasketId);
    });

    it('should throw MultiChainTokenBasketNotFoundError if basket not found on any network', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);

      await expect(service.getSingleBasketInMultipleChains(mockBasketId)).rejects.toThrow(
        MultiChainTokenBasketNotFoundError,
      );
    });

    it('should filter basket by chainIds when provided', async () => {
      const multiChainBasket: ITokenBasketConfiguration = {
        ...mockBasket,
        chainIds: [ChainId.ETHEREUM, ChainId.MONAD],
        addresses: [
          { chainId: ChainId.ETHEREUM, address: '0xeth' },
          { chainId: ChainId.MONAD, address: '0xmonad' },
        ],
      };
      const filteredBasket = {
        ...multiChainBasket,
        chainIds: [ChainId.MONAD],
        addresses: [{ chainId: ChainId.MONAD, address: '0xmonad' }],
      };
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(filteredBasket);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([]);

      const result = await service.getSingleBasketInMultipleChains(mockBasketId, [ChainId.MONAD]);

      expect(result.chainIds).toEqual([ChainId.MONAD]);
    });

    it('should throw MultiChainTokenBasketNotFoundError if filtering result in no chains', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);
      await expect(service.getSingleBasketInMultipleChains(mockBasketId, [ChainId.MONAD])).rejects.toThrow(
        MultiChainTokenBasketNotFoundError,
      );
    });
  });

  describe('getSingleChainBasket', () => {
    it('should return specific hydrated basket', async () => {
      jest.spyOn(basketsClient, 'getSingleChainBasket').mockResolvedValue(mockBasket);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBasketId);
      expect(result.tokens[0]).toEqual(expectedToken);
    });

    it('should throw SingleChainTokenBasketNotFoundError if basket fetch throws', async () => {
      jest
        .spyOn(basketsClient, 'getSingleChainBasket')
        .mockRejectedValue(new SingleChainTokenBasketNotFoundError({ basketId: mockBasketId, chainId: mockChainId }));

      await expect(service.getSingleChainBasket(mockChainId, mockBasketId)).rejects.toThrow(
        SingleChainTokenBasketNotFoundError,
      );
    });

    it('should throw SingleChainTokenBasketNotFoundError if basket exists but not on requested chain', async () => {
      jest
        .spyOn(basketsClient, 'getSingleChainBasket')
        .mockRejectedValue(
          new SingleChainTokenBasketNotFoundError({ basketId: mockBasketId, chainId: ChainId.ETHEREUM }),
        );

      await expect(service.getSingleChainBasket(ChainId.ETHEREUM, mockBasketId)).rejects.toThrow(
        SingleChainTokenBasketNotFoundError,
      );
    });
  });

  describe('caching behavior', () => {
    it('should use cached tokens when cache hit occurs', async () => {
      const mockKey = `basket-${mockBasketId}-mock-cache-key`;
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue([mockIndexerToken]);
      const indexerSpy = jest.spyOn(indexerClient, 'getSingleChainTokens');

      const result = await service.getBaskets();

      expect(indexerSpy).not.toHaveBeenCalled();
      expect(result[0].tokens[0]).toEqual(expectedToken);
      expect(cacheService.get).toHaveBeenCalledWith(mockKey);
    });

    it('should fetch from indexer and cache when cache miss occurs', async () => {
      const mockKey = `basket-${mockBasketId}-mock-cache-key`;
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);
      const setSpy = jest.spyOn(cacheService, 'set');

      await service.getBaskets();

      expect(setSpy).toHaveBeenCalledWith(mockKey, [mockIndexerToken]);
    });

    it('should compute cache key from token IDs for each basket', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);
      const computeKeySpy = jest.spyOn(cacheService, 'computeCacheKey');

      await service.getBaskets();

      expect(computeKeySpy).toHaveBeenCalledWith([`${mockChainId}-0xtoken`]);
    });

    it('should handle partial cache hits (some baskets cached, some missing)', async () => {
      const basket1 = { ...mockBasket, id: 'basket-1' as BasketId, addresses: [{ chainId: 1, address: '0x1' }] };
      const basket2 = { ...mockBasket, id: 'basket-2' as BasketId, addresses: [{ chainId: 1, address: '0x2' }] };

      const token1: any = { chainId: 1, address: '0x1', symbol: 'T1' };
      const token2: any = { chainId: 1, address: '0x2', symbol: 'T2' };

      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([basket1, basket2]);

      // Basket 1 is cached, Basket 2 is missing
      jest.spyOn(cacheService, 'get').mockImplementation((key) => {
        if (key.includes('basket-1')) return [token1];
        return undefined;
      });

      const indexerSpy = jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([token2]);

      const result = await service.getBaskets();

      // Only tokens for basket-2 should be fetched
      expect(indexerSpy).toHaveBeenCalledWith({ ids: ['1-0x1', '1-0x2'].filter((id) => id === '1-0x2') });
      expect(result).toHaveLength(2);
      expect(result.find((b) => (b.id as any) === 'basket-1')?.tokens[0].symbol).toBe('T1');
      expect(result.find((b) => (b.id as any) === 'basket-2')?.tokens[0].symbol).toBe('T2');
    });

    it('should fetch overlapping tokens only once across multiple missing baskets', async () => {
      const basket1 = { ...mockBasket, id: 'basket-1' as BasketId, addresses: [{ chainId: 1, address: '0xshared' }] };
      const basket2 = { ...mockBasket, id: 'basket-2' as BasketId, addresses: [{ chainId: 1, address: '0xshared' }] };

      const sharedToken: any = { chainId: 1, address: '0xshared', symbol: 'SHARED' };

      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([basket1, basket2]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      const indexerSpy = jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([sharedToken]);

      await service.getBaskets();

      // Should only call indexer once for '1-0xshared'
      expect(indexerSpy).toHaveBeenCalledWith({ ids: ['1-0xshared'] });
      expect(cacheService.set).toHaveBeenCalledTimes(2); // Once per basket
    });

    it('should propagate indexer errors', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(cacheService, 'get').mockReturnValue(undefined);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockRejectedValue(new Error('Indexer down'));

      await expect(service.getBaskets()).rejects.toThrow('Indexer down');
    });
  });
});
