import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ITokenBasketSourceResponse } from '../interfaces/token-basket-source-response.interface';

@Injectable()
export class TokenBasketsClient {
  private readonly logger = new Logger(TokenBasketsClient.name);
  private readonly baseUrl = 'https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/baskets';

  constructor(private readonly httpService: HttpService) {}

  async getAllBaskets(): Promise<ITokenBasketConfiguration[]> {
    const url = `${this.baseUrl}/all.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<{ baskets: ITokenBasketSourceResponse[] }>(url));

      return data.baskets.map((basket) => this.mapSourceToConfiguration(basket));
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return [];

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch all baskets: ${errorMessage}`);
      throw error;
    }
  }

  async getBasket(basketId: BasketId): Promise<ITokenBasketConfiguration | null> {
    const url = `${this.baseUrl}/${basketId}.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<ITokenBasketSourceResponse>(url));
      return this.mapSourceToConfiguration(data);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return null;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch basket ${basketId}: ${errorMessage}`);
      throw error;
    }
  }

  private mapSourceToConfiguration(data: ITokenBasketSourceResponse): ITokenBasketConfiguration {
    const chainIds: ChainId[] = [];
    const addresses: { chainId: ChainId; address: string }[] = [];

    for (const [chainIdStr, tokenAddresses] of Object.entries(data.addresses)) {
      const chainId = parseInt(chainIdStr, 10);

      if (!isNaN(chainId)) {
        chainIds.push(chainId);
        tokenAddresses.forEach((addr) => {
          addresses.push({ chainId, address: addr.toLowerCase() });
        });
      }
    }

    return {
      id: data.id as BasketId,
      name: data.name,
      description: data.description,
      logoUrl: data.logo,
      lastUpdated: data.lastUpdated,
      chainIds,
      addresses,
    };
  }
}
