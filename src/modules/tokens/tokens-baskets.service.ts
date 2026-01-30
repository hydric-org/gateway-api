import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { ITokenBasket } from '@core/interfaces/token/token-basket.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensBasketsService {
  constructor(
    private readonly tokenBasketsClient: TokenBasketsClient,
    private readonly indexerClient: LiquidityPoolsIndexerClient,
  ) {}

  async getMultiChainBaskets(): Promise<ITokenBasket[]> {
    const allBaskets = await this.tokenBasketsClient.getAllBaskets();
    return this._getTokensForTokenBasket(allBaskets);
  }

  async getSingleChainBaskets(chainId: ChainId): Promise<ITokenBasket[]> {
    const allBaskets = await this.tokenBasketsClient.getAllBaskets();

    const chainBaskets = allBaskets
      .filter((basket) => basket.chainIds.includes(Number(chainId)))
      .map((basket) => ({
        ...basket,
        chainIds: [chainId],
        addresses: basket.addresses.filter((addr) => addr.chainId === chainId),
      }));

    if (chainBaskets.length === 0) return [];

    return this._getTokensForTokenBasket(chainBaskets);
  }

  async getSingleMultiChainBasket(basketId: BasketId): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getBasket(basketId);

    if (!basket) throw new TokenBasketNotFoundError({ basketId });

    const [hydratedBasket] = await this._getTokensForTokenBasket([basket]);
    return hydratedBasket;
  }

  async getSingleChainBasket(chainId: ChainId, basketId: BasketId): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getBasket(basketId);

    if (!basket || !basket.chainIds.includes(chainId)) {
      throw new TokenBasketNotFoundError({ basketId, chainId });
    }

    const singleChainBasket = {
      ...basket,
      chainIds: [chainId],
      addresses: basket.addresses.filter((addr) => addr.chainId === chainId),
    };

    const [hydratedBasket] = await this._getTokensForTokenBasket([singleChainBasket]);
    return hydratedBasket;
  }

  private async _getTokensForTokenBasket(baskets: ITokenBasketConfiguration[]): Promise<ITokenBasket[]> {
    const uniqueTokenIds = new Set<string>();

    for (const basket of baskets) {
      for (const address of basket.addresses) {
        uniqueTokenIds.add(`${address.chainId}-${address.address}`.toLowerCase());
      }
    }

    const allTokens = await this.indexerClient.getTokens({
      ids: Array.from(uniqueTokenIds),
    });

    const tokenIdToSingleChainToken = new Map<string, ISingleChainToken>();

    for (const token of allTokens) {
      const tokenId = `${token.chainId}-${token.address}`.toLowerCase();

      tokenIdToSingleChainToken.set(tokenId, {
        chainId: token.chainId,
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoUrl: token.logoUrl,
        totalValuePooledUsd: token.totalValuePooledUsd,
      });
    }

    return baskets.map((basket) => {
      const basketTokens: ISingleChainToken[] = [];

      for (const tokenAddress of basket.addresses) {
        const tokenId = `${tokenAddress.chainId}-${tokenAddress.address}`;
        const token = tokenIdToSingleChainToken.get(tokenId);

        if (token) basketTokens.push(token);
      }

      basketTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

      return {
        ...basket,
        tokens: basketTokens,
      };
    });
  }
}
