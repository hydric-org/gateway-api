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
  const mockChainId = 1;
  const mockRawResponse = {
    id: 'usd-stablecoins',
    name: 'USD Stablecoins',
    logo: 'https://logo.url',
    description: 'Description',
    lastUpdated: '2023-01-01',
    index: ['0x123', '0x456'],
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

  describe('getBasket', () => {
    it('should return mapped basket when request is successful', async () => {
      const mockAxiosResponse = {
        data: mockRawResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await client.getBasket(mockChainId, mockBasketId);

      expect(result).toEqual(<ITokenBasketConfiguration>{
        id: BasketId.USD_STABLECOINS,
        name: 'USD Stablecoins',
        logoUrl: 'https://logo.url',
        description: 'Description',
        lastUpdated: '2023-01-01',
        chainIds: [mockChainId],
        addresses: [
          { chainId: mockChainId, address: '0x123' },
          { chainId: mockChainId, address: '0x456' },
        ],
      });
      expect(httpService.get).toHaveBeenCalledWith(
        `https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/baskets/${mockChainId}/${mockBasketId}.json`,
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

      const result = await client.getBasket(mockChainId, mockBasketId);

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

      await expect(client.getBasket(mockChainId, mockBasketId)).rejects.toEqual(errorResponse);
    });
  });
});
