import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { TokenBasketsClient } from './token-baskets.client';

describe('TokenBasketsClient', () => {
  let client: TokenBasketsClient;
  let httpService: HttpService;

  const mockBasketId = BasketId.USD_STABLECOINS;
  const mockRawResponse = {
    id: 'usd-stablecoins',
    name: 'USD Stablecoins',
    logo: 'https://logo.url',
    description: 'Description',
    lastUpdated: '2023-01-01',
    addresses: {
      '1': ['0x123', '0x456'],
      '8453': ['0x789'],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBasketsClient,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    client = module.get<TokenBasketsClient>(TokenBasketsClient);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  describe('getAllBasketsForAllChains', () => {
    it('should return all baskets mapped correctly', async () => {
      const mockAxiosResponse = {
        data: { baskets: [mockRawResponse] },
        status: 200,
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await client.getAllBasketsForAllChains();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(<ITokenBasketConfiguration>{
        id: BasketId.USD_STABLECOINS,
        name: 'USD Stablecoins',
        logoUrl: 'https://logo.url',
        description: 'Description',
        lastUpdated: '2023-01-01',
        chainIds: [1, 8453],
        addresses: [
          { chainId: 1, address: '0x123' },
          { chainId: 1, address: '0x456' },
          { chainId: 8453, address: '0x789' },
        ],
      });
      expect(httpService.get).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/baskets/all.json',
      );
    });

    it('should return empty array on 404', async () => {
      const errorResponse = {
        isAxiosError: true,
        response: { status: 404 },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => errorResponse));

      const result = await client.getAllBasketsForAllChains();
      expect(result).toEqual([]);
    });
  });

  describe('getSingleBasketForAllChains', () => {
    it('should return mapped basket when request is successful', async () => {
      const mockAxiosResponse = {
        data: mockRawResponse,
        status: 200,
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await client.getSingleBasketForAllChains(mockBasketId);

      expect(result).toEqual(<ITokenBasketConfiguration>{
        id: BasketId.USD_STABLECOINS,
        name: 'USD Stablecoins',
        logoUrl: 'https://logo.url',
        description: 'Description',
        lastUpdated: '2023-01-01',
        chainIds: [1, 8453],
        addresses: [
          { chainId: 1, address: '0x123' },
          { chainId: 1, address: '0x456' },
          { chainId: 8453, address: '0x789' },
        ],
      });
      expect(httpService.get).toHaveBeenCalledWith(
        `https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/baskets/${mockBasketId}.json`,
      );
    });

    it('should return null when request fails with 404', async () => {
      const errorResponse = {
        isAxiosError: true,
        response: {
          status: 404,
        },
        message: 'Not Found',
      };

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => errorResponse));

      const result = await client.getSingleBasketForAllChains(mockBasketId);

      expect(result).toBeNull();
    });

    it('should throw error when request fails with non-404 error', async () => {
      const errorResponse = {
        isAxiosError: true,
        response: {
          status: 500,
        },
        message: 'Internal Server Error',
      };

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => errorResponse));

      await expect(client.getSingleBasketForAllChains(mockBasketId)).rejects.toEqual(errorResponse);
    });
  });

  describe('getSingleBasketForSingleChain', () => {
    const mockChainId = 1;

    it('should return mapped basket for specific chain when successful', async () => {
      const mockAxiosResponse = {
        data: mockRawResponse,
        status: 200,
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await client.getSingleBasketForSingleChain(mockBasketId, mockChainId);

      expect(result).toEqual(<ITokenBasketConfiguration>{
        id: mockBasketId,
        name: 'USD Stablecoins',
        logoUrl: 'https://logo.url',
        description: 'Description',
        lastUpdated: '2023-01-01',
        chainIds: [mockChainId],
        addresses: [
          { chainId: 1, address: '0x123' },
          { chainId: 1, address: '0x456' },
        ],
      });
    });

    it('should throw TokenBasketNotFoundError if chain is not in basket', async () => {
      const mockAxiosResponse = {
        data: mockRawResponse,
        status: 200,
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await expect(client.getSingleBasketForSingleChain(mockBasketId, ChainId.SCROLL)).rejects.toThrow();
    });

    it('should throw TokenBasketNotFoundError on 404', async () => {
      const errorResponse = {
        isAxiosError: true,
        response: { status: 404 },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => errorResponse));

      await expect(client.getSingleBasketForSingleChain(mockBasketId, mockChainId)).rejects.toThrow();
    });
  });
});
