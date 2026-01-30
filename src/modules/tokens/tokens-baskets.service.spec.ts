import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
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
      ],
    }).compile();

    service = module.get<TokensBasketsService>(TokensBasketsService);
    basketsClient = module.get<TokenBasketsClient>(TokenBasketsClient);
    indexerClient = module.get<LiquidityPoolsIndexerClient>(LiquidityPoolsIndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBaskets', () => {
    it('should return all valid hydrated baskets', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([mockBasket]);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getBaskets();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tokens).toHaveLength(1);
      expect(result[0].tokens[0]).toEqual(expectedToken);
    });

    it('should return empty array if no baskets found', async () => {
      jest.spyOn(basketsClient, 'getBaskets').mockResolvedValue([]);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([]);

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
  });

  describe('getSingleBasketInMultipleChains', () => {
    it('should return basket across available networks', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(mockBasket);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleBasketInMultipleChains(mockBasketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBasketId);
    });

    it('should throw TokenBasketNotFoundError if basket not found on any network', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);

      await expect(service.getSingleBasketInMultipleChains(mockBasketId)).rejects.toThrow(TokenBasketNotFoundError);
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
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([]);

      const result = await service.getSingleBasketInMultipleChains(mockBasketId, [ChainId.MONAD]);

      expect(result.chainIds).toEqual([ChainId.MONAD]);
    });

    it('should throw TokenBasketNotFoundError if filtering result in no chains', async () => {
      jest.spyOn(basketsClient, 'getBasket').mockResolvedValue(null);
      await expect(service.getSingleBasketInMultipleChains(mockBasketId, [ChainId.MONAD])).rejects.toThrow(
        TokenBasketNotFoundError,
      );
    });
  });

  describe('getSingleChainBasket', () => {
    it('should return specific hydrated basket', async () => {
      jest.spyOn(basketsClient, 'getSingleChainBasket').mockResolvedValue(mockBasket);
      jest.spyOn(indexerClient, 'getSingleChainTokens').mockResolvedValue([mockIndexerToken]);

      const result = await service.getSingleChainBasket(mockChainId, mockBasketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBasketId);
      expect(result.tokens[0]).toEqual(expectedToken);
    });

    it('should throw TokenBasketNotFoundError if basket fetch returns null', async () => {
      jest.spyOn(basketsClient, 'getSingleChainBasket').mockResolvedValue(null);

      await expect(service.getSingleChainBasket(mockChainId, mockBasketId)).rejects.toThrow(TokenBasketNotFoundError);
    });

    it('should throw TokenBasketNotFoundError if basket exists but not on requested chain', async () => {
      jest
        .spyOn(basketsClient, 'getSingleChainBasket')
        .mockRejectedValue(new TokenBasketNotFoundError({ basketId: mockBasketId, chainId: ChainId.ETHEREUM }));

      await expect(service.getSingleChainBasket(ChainId.ETHEREUM, mockBasketId)).rejects.toThrow(
        TokenBasketNotFoundError,
      );
    });
  });
});
