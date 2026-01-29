import { ChainId, ChainIdUtils } from '@core/enums/chain-id';
import { BasketId, BasketIdUtils } from '@core/enums/token/basket-id.enum';
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
    const supportedBaskets = BasketIdUtils.values();
    const supportedChains = ChainIdUtils.values();

    const promises: Promise<ITokenBasketConfiguration | null>[] = [];

    for (const basketId of supportedBaskets) {
      for (const chainId of supportedChains) promises.push(this.tokenBasketsClient.getBasket(chainId, basketId));
    }

    console.log('getting baskets');
    const results = await Promise.all(promises);
    console.log('got baskets');
    const validBaskets = results.filter((basket) => basket !== null);

    if (validBaskets.length === 0) return [];

    console.log('merging baskets');
    const mergedBaskets = this._mergeBaskets(validBaskets);
    console.log('hydrating baskets');
    return this._getTokensForTokenBasket(mergedBaskets);
  }

  async getSingleChainBaskets(chainId: ChainId): Promise<ITokenBasket[]> {
    const supportedBaskets = BasketIdUtils.values();

    const promises = supportedBaskets.map((basketId) => this.tokenBasketsClient.getBasket(chainId, basketId));

    const results = await Promise.all(promises);
    const validBaskets = results.filter((basket) => basket !== null);

    return this._getTokensForTokenBasket(validBaskets);
  }

  async getSingleMultiChainBasket(basketId: BasketId): Promise<ITokenBasket> {
    const supportedChains = ChainIdUtils.values();

    const promises = supportedChains.map((chainId) => this.tokenBasketsClient.getBasket(chainId, basketId));

    const results = await Promise.all(promises);
    const validBaskets = results.filter((basket) => basket !== null);

    if (validBaskets.length === 0) throw new TokenBasketNotFoundError({ basketId });

    const mergedBaskets = this._mergeBaskets(validBaskets);
    const [hydratedBasket] = await this._getTokensForTokenBasket(mergedBaskets);

    return hydratedBasket;
  }

  async getSingleChainBasket(chainId: ChainId, basketId: BasketId): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getBasket(chainId, basketId);

    // Since the user is asking for a specific resource (Chain+Basket),
    // we throw 404 if it doesn't exist.
    if (!basket) throw new TokenBasketNotFoundError({ basketId, chainId });

    const [hydratedBasket] = await this._getTokensForTokenBasket([basket]);
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

  private _mergeBaskets(basketsToMerge: ITokenBasketConfiguration[]): ITokenBasketConfiguration[] {
    const basketIdToBasketConfig = new Map<BasketId, ITokenBasketConfiguration>();

    for (const basket of basketsToMerge) {
      const existingBasketConfigForId = basketIdToBasketConfig.get(basket.id);

      if (!existingBasketConfigForId) {
        basketIdToBasketConfig.set(basket.id, basket);
        continue;
      }

      existingBasketConfigForId.chainIds = Array.from(
        new Set([...existingBasketConfigForId.chainIds, ...basket.chainIds]),
      );

      existingBasketConfigForId.addresses = [...existingBasketConfigForId.addresses, ...basket.addresses];
    }

    return Array.from(basketIdToBasketConfig.values());
  }
}
