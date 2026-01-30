import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { TokenBasketsResponseAdapter } from '../adapters/token-baskets-response-adapter';
import { ITokenBasketSourceResponse } from '../interfaces/token-basket-source-response.interface';

@Injectable()
export class TokenBasketsClient {
  private readonly logger = new Logger(TokenBasketsClient.name);
  private readonly baseUrl = 'https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/baskets';

  constructor(private readonly httpService: HttpService) {}

  async getAllBasketsForAllChains(): Promise<ITokenBasketConfiguration[]> {
    const url = `${this.baseUrl}/all.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<{ baskets: ITokenBasketSourceResponse[] }>(url));

      return data.baskets.map((basket) => {
        const { chainIds, addresses } = TokenBasketsResponseAdapter.getChainIdsAndAddressesFromResponse(basket);

        return {
          id: basket.id as BasketId,
          name: basket.name,
          description: basket.description,
          logoUrl: basket.logo,
          lastUpdated: basket.lastUpdated,
          chainIds,
          addresses,
        };
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return [];

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch all baskets: ${errorMessage}`);
      throw error;
    }
  }

  async getSingleBasketForAllChains(basketId: BasketId): Promise<ITokenBasketConfiguration | null> {
    const url = `${this.baseUrl}/${basketId}.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<ITokenBasketSourceResponse>(url));
      const { chainIds, addresses } = TokenBasketsResponseAdapter.getChainIdsAndAddressesFromResponse(data);

      return {
        id: data.id as BasketId,
        name: data.name,
        description: data.description,
        logoUrl: data.logo,
        lastUpdated: data.lastUpdated,
        chainIds,
        addresses,
      };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return null;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch basket ${basketId}: ${errorMessage}`);
      throw error;
    }
  }

  async getSingleBasketForSingleChain(basketId: BasketId, chainId: ChainId): Promise<ITokenBasketConfiguration | null> {
    const url = `${this.baseUrl}/${basketId}.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<ITokenBasketSourceResponse>(url));
      const chainAddresses = data.addresses[chainId];

      if (!chainAddresses) {
        throw new TokenBasketNotFoundError({
          basketId,
          chainId,
        });
      }

      return {
        id: basketId,
        name: data.name,
        description: data.description,
        logoUrl: data.logo,
        lastUpdated: data.lastUpdated,
        chainIds: [chainId],
        addresses: chainAddresses.map((address) => ({ address, chainId })),
      };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new TokenBasketNotFoundError({ basketId, chainId });
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch basket ${basketId}: ${errorMessage}`);
      throw error;
    }
  }
}
