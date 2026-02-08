import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { SingleChainTokenBasketNotFoundError } from '@core/errors/single-chain-token-basket-not-found.error';
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

  async getBaskets(chainIds?: ChainId[], basketIds?: BasketId[]): Promise<ITokenBasketConfiguration[]> {
    if (basketIds && basketIds.length > 0) return this._getBasketsByIds(basketIds, chainIds);

    return this._getAllBaskets(chainIds);
  }

  private async _getAllBaskets(chainIds?: ChainId[]): Promise<ITokenBasketConfiguration[]> {
    const url = `${this.baseUrl}/all.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<{ baskets: ITokenBasketSourceResponse[] }>(url));

      const baskets = data.baskets.map((basket) => TokenBasketsResponseAdapter.toConfiguration(basket));

      return TokenBasketsResponseAdapter.filterBasketsByChainIds(baskets, chainIds);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return [];

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch all baskets: ${errorMessage}`);
      throw error;
    }
  }

  private async _getBasketsByIds(basketIds: BasketId[], chainIds?: ChainId[]): Promise<ITokenBasketConfiguration[]> {
    const basketPromises = basketIds.map((id) => this.getBasket(id, chainIds));
    const results = await Promise.all(basketPromises);

    return results.filter((basket): basket is ITokenBasketConfiguration => basket !== null);
  }

  async getBasket(basketId: BasketId, chainIds?: ChainId[]): Promise<ITokenBasketConfiguration | null> {
    const url = `${this.baseUrl}/${basketId}.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<ITokenBasketSourceResponse>(url));

      const basket = TokenBasketsResponseAdapter.toConfiguration(data);

      const [filteredBasket] = TokenBasketsResponseAdapter.filterBasketsByChainIds([basket], chainIds);

      return filteredBasket || null;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return null;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch basket ${basketId}: ${errorMessage}`);
      throw error;
    }
  }

  async getSingleChainBasket(basketId: BasketId, chainId: ChainId): Promise<ITokenBasketConfiguration> {
    const basket = await this.getBasket(basketId, [chainId]);

    if (!basket) {
      throw new SingleChainTokenBasketNotFoundError({
        basketId,
        chainId,
      });
    }

    return basket;
  }
}
