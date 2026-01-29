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

  constructor(private readonly httpService: HttpService) {}

  async getBasket(chainId: ChainId, basketId: BasketId): Promise<ITokenBasketConfiguration | null> {
    const url = `https://cdn.jsdelivr.net/gh/hydric-org/token-baskets/baskets/${chainId}/${basketId}.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<ITokenBasketSourceResponse>(url));

      return {
        id: data.id as BasketId,
        name: data.name,
        description: data.description,
        logoUrl: data.logo,
        lastUpdated: data.lastUpdated,
        chainIds: [chainId],
        addresses: data.index.map((addr) => ({
          chainId,
          address: addr.toLowerCase(),
        })),
      };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return null;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch basket ${basketId} for chain ${chainId}: ${errorMessage}`);
      throw error;
    }
  }
}
