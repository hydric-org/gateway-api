import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { MultiChainTokenBasketNotFoundError } from '@core/errors/multi-chain-token-basket-not-found.error';
import { ILiquidityPoolsIndexerSingleChainToken } from '@core/interfaces/token/liquidity-pools-indexer-single-chain-token.interface';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { ITokenBasket } from '@core/interfaces/token/token-basket.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';
import { BasketTokensCacheService } from './basket-tokens-cache.service';

@Injectable()
export class TokensBasketsService {
  constructor(
    private readonly tokenBasketsClient: TokenBasketsClient,
    private readonly indexerClient: LiquidityPoolsIndexerClient,
    private readonly basketTokensCacheService: BasketTokensCacheService,
  ) {}

  async getBaskets(chainIds?: ChainId[], basketIds?: BasketId[]): Promise<ITokenBasket[]> {
    const filteredBaskets = await this.tokenBasketsClient.getBaskets(chainIds, basketIds);

    return this._getTokensMetadataForTokenBasket(filteredBaskets);
  }

  async getSingleBasketInMultipleChains(basketId: BasketId, chainIds?: ChainId[]): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getBasket(basketId, chainIds);

    if (!basket) throw new MultiChainTokenBasketNotFoundError({ basketId, chainIds });

    const [tokenBasketWithTokensMetadata] = await this._getTokensMetadataForTokenBasket([basket]);
    return tokenBasketWithTokensMetadata;
  }

  async getSingleChainBasket(chainId: ChainId, basketId: BasketId): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getSingleChainBasket(basketId, chainId);

    const [tokenBasketWithTokensMetadata] = await this._getTokensMetadataForTokenBasket([basket]);
    return tokenBasketWithTokensMetadata;
  }

  private async _getTokensMetadataForTokenBasket(baskets: ITokenBasketConfiguration[]): Promise<ITokenBasket[]> {
    if (baskets.length === 0) return [];

    const basketCacheKeyToTokens = new Map<string, ILiquidityPoolsIndexerSingleChainToken[]>();
    const missingBaskets: { basket: ITokenBasketConfiguration; cacheKey: string; tokenIds: string[] }[] = [];
    const allMissingTokenIds = new Set<string>();

    const basketsWithKeys = baskets.map((basket) => {
      const tokenIds = basket.addresses.map((a) => `${a.chainId}-${a.address}`.toLowerCase());
      const cacheKey = `basket-${basket.id}-${this.basketTokensCacheService.computeCacheKey(tokenIds)}`;
      return { basket, cacheKey, tokenIds };
    });

    for (const bk of basketsWithKeys) {
      const cached = this.basketTokensCacheService.get(bk.cacheKey);

      if (cached) {
        basketCacheKeyToTokens.set(bk.cacheKey, cached);
      } else {
        missingBaskets.push(bk);
        bk.tokenIds.forEach((id) => allMissingTokenIds.add(id));
      }
    }

    if (allMissingTokenIds.size > 0) {
      const fetchedTokens = await this.indexerClient.getSingleChainTokens({ ids: Array.from(allMissingTokenIds) });
      const tokenIdToToken = new Map<string, ILiquidityPoolsIndexerSingleChainToken>(
        fetchedTokens.map((t) => [`${t.chainId}-${t.address}`.toLowerCase(), t]),
      );

      for (const mb of missingBaskets) {
        const basketTokens = mb.tokenIds
          .map((id) => tokenIdToToken.get(id))
          .filter((t): t is ILiquidityPoolsIndexerSingleChainToken => !!t);

        this.basketTokensCacheService.set(mb.cacheKey, basketTokens);
        basketCacheKeyToTokens.set(mb.cacheKey, basketTokens);
      }
    }

    return basketsWithKeys.map((bk) => {
      const tokens = basketCacheKeyToTokens.get(bk.cacheKey) || [];

      const basketTokens: ISingleChainTokenMetadata[] = tokens.map((token) => ({
        chainId: token.chainId,
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoUrl: TOKEN_LOGO(token.chainId, token.address),
      }));

      basketTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

      return {
        ...bk.basket,
        tokens: basketTokens,
      };
    });
  }
}
