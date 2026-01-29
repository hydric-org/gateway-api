import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { Test, TestingModule } from '@nestjs/testing';
import { TokensBasketsService } from './tokens-baskets.service';

describe('TokensBasketsService', () => {
  let service: TokensBasketsService;
  let basketsClient: TokenBasketsClient;
  let indexerClient: LiquidityPoolsIndexerClient;

  // Mock Data
  const mockBasketId = BasketId.USD_STABLECOINS;
  const mockChainId = ChainId.ETHEREUM;

  const mockBasket: ITokenBasketConfiguration = {
    id: mockBasketId,
    name: 'USD Stablecoins',
    description: 'Test',
    logoUrl: 'url',
    lastUpdated: 'date',
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

  const expectedToken: ISingleChainToken = {
    chainId: mockChainId,
    address: '0xtoken',
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
    logoUrl: 'logo',
    totalValuePooledUsd: 1000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensBasketsService,
        {
          provide: TokenBasketsClient,
          useValue: {
            getBasket: jest.fn(),
          },
        },
        {
          provide: LiquidityPoolsIndexerClient,
          useValue: {
            getTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokensBasketsService>(TokensBasketsService);
    basketsClient = module.get<TokenBasketsClient>(TokenBasketsClient);
    indexerClient = module.get<LiquidityPoolsIndexerClient>(LiquidityPoolsIndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMultiChainBaskets', () => {
    it('should return all valid hydrated baskets', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockImplementation(async (chain, basket) => {
        if (chain === mockChainId && basket === mockBasketId) return mockBasket;
        return await Promise.resolve(null); // Simulate 404 for others
      });
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getMultiChainBaskets();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tokens).toHaveLength(1);
      expect(result[0].tokens[0]).toEqual(expectedToken);
    });

    it('should return empty array if no baskets found', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([]);

      const result = await service.getMultiChainBaskets();
      expect(result).toEqual([]);
    });
  });

  describe('getSingleChainBaskets (by chain)', () => {
    it('should return hydrated baskets for the chain', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockImplementation(async (_, id) => {
        return await Promise.resolve(id === mockBasketId ? mockBasket : null);
      });
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleChainBaskets(mockChainId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockBasketId);
      expect(result[0].tokens[0]).toEqual(expectedToken);
      expect(basketsClient.getBasket).toHaveBeenCalledWith(mockChainId, expect.anything());
    });
  });

  describe('getSingleMultiChainBasket', () => {
    it('should return basket across available networks', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockImplementation(async (chain) => {
        return await Promise.resolve(chain === mockChainId ? mockBasket : null);
      });
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleMultiChainBasket(mockBasketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBasketId);
    });

    it('should throw TokenBasketNotFoundError if basket not found on any network', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);

      await expect(service.getSingleMultiChainBasket(mockBasketId)).rejects.toThrow(TokenBasketNotFoundError);
    });
  });

  describe('getSingleChainBasket', () => {
    it('should return specific hydrated basket', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(mockBasket);
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBasketId);
      expect(result.tokens[0]).toEqual(expectedToken);
    });

    it('should throw TokenBasketNotFoundError if basket fetch returns null', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);

      await expect(service.getSingleChainBasket(mockChainId, mockBasketId)).rejects.toThrow(TokenBasketNotFoundError);
    });
  });
  describe('hydration', () => {
    it('should hydrate tokens correctly', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(mockBasket);
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]).toEqual(expectedToken);
    });

    it('should handle missing tokens in hydration gracefully', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(mockBasket);
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([]);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result.tokens).toHaveLength(0);
    });

    it('should skip hydration if no token addresses in basket', async () => {
      const emptyBasket = { ...mockBasket, addresses: [] };
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(emptyBasket);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result.tokens).toHaveLength(0);
      expect(indexerClient.getTokens).not.toHaveBeenCalled();
    });
    it('should handle partial token metadata found', async () => {
      // Basket has 2 tokens, but indexer only finds 1
      const basketWithTwo = {
        ...mockBasket,
        addresses: [
          { chainId: mockChainId, address: '0xone' },
          { chainId: mockChainId, address: '0xtwo' },
        ],
      };
      const oneIndexerToken = { ...mockIndexerToken, address: '0xone' };

      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(basketWithTwo);
      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([oneIndexerToken]);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].address).toBe('0xone');
    });
  });

  describe('merging logic', () => {
    it('should aggregate multiple baskets of the same ID into one', async () => {
      const basketEth: ITokenBasketConfiguration = {
        ...mockBasket,
        chainIds: [ChainId.ETHEREUM],
        addresses: [{ chainId: ChainId.ETHEREUM, address: '0xeth' }],
        lastUpdated: '2026-01-01',
      };
      const basketMonad: ITokenBasketConfiguration = {
        ...mockBasket,
        chainIds: [ChainId.MONAD],
        addresses: [{ chainId: ChainId.MONAD, address: '0xmonad' }],
        lastUpdated: '2026-01-02', // More recent
      };

      jest.spyOn(basketsClient, 'getBasket').mockImplementation(async (chain, basketId) => {
        if (basketId !== mockBasketId) return await Promise.resolve(null);
        if (chain === ChainId.ETHEREUM) return await Promise.resolve(basketEth);
        if (chain === ChainId.MONAD) return await Promise.resolve(basketMonad);
        return await Promise.resolve(null);
      });

      jest.spyOn(indexerClient, 'getTokens').mockResolvedValue([]);

      const result = await service.getMultiChainBaskets();

      // Should have only 1 basket even though it's on 2 chains
      expect(result).toHaveLength(1);
      const merged = result[0];
      expect(merged.id).toBe(mockBasketId);
      // Should have both chain IDs
      expect(merged.chainIds).toContain(ChainId.ETHEREUM);
      expect(merged.chainIds).toContain(ChainId.MONAD);
      // Should have both addresses
      expect(merged.addresses).toHaveLength(2);
      // Should have most recent metadata
      expect(merged.lastUpdated).toBe('2026-01-02');
    });
  });
});
