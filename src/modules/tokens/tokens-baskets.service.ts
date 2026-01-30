import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TokenBasketNotFoundError } from '@core/errors/token-basket-not-found.error';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';
import { ITokenBasket } from '@core/interfaces/token/token-basket.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensBasketsService {
  constructor(
    private readonly tokenBasketsClient: TokenBasketsClient,
    private readonly indexerClient: LiquidityPoolsIndexerClient,
  ) {}

  async getBaskets(chainIds?: ChainId[]): Promise<ITokenBasket[]> {
    const filteredBaskets = await this.tokenBasketsClient.getBaskets(chainIds);

    return this._getTokensMetadataForTokenBasket(filteredBaskets);
  }

  async getSingleBasketInMultipleChains(basketId: BasketId, chainIds?: ChainId[]): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getBasket(basketId, chainIds);

    if (!basket) throw new TokenBasketNotFoundError({ basketId });

    const [tokenBasketWithTokensMetadata] = await this._getTokensMetadataForTokenBasket([basket]);
    return tokenBasketWithTokensMetadata;
  }

  async getSingleChainBasket(chainId: ChainId, basketId: BasketId): Promise<ITokenBasket> {
    const basket = await this.tokenBasketsClient.getSingleChainBasket(basketId, chainId);

    if (!basket) throw new TokenBasketNotFoundError({ basketId, chainId });

    const [tokenBasketWithTokensMetadata] = await this._getTokensMetadataForTokenBasket([basket]);
    return tokenBasketWithTokensMetadata;
  }

  private async _getTokensMetadataForTokenBasket(baskets: ITokenBasketConfiguration[]): Promise<ITokenBasket[]> {
    if (baskets.length === 0) return [];

    const uniqueTokenIds = new Set<string>();

    for (const basket of baskets) {
      for (const address of basket.addresses) {
        uniqueTokenIds.add(`${address.chainId}-${address.address}`.toLowerCase());
      }
    }

    const allTokens = await this.indexerClient.getSingleChainTokens({
      ids: Array.from(uniqueTokenIds),
    });

    const tokenIdToSingleChainToken = new Map<string, ISingleChainTokenMetadata>();

    for (const token of allTokens) {
      const tokenId = `${token.chainId}-${token.address}`.toLowerCase();

      tokenIdToSingleChainToken.set(tokenId, {
        chainId: token.chainId,
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoUrl: TOKEN_LOGO(token.chainId, token.address),
      });
    }

    return baskets.map((basket) => {
      const basketTokens: ISingleChainTokenMetadata[] = [];

      for (const tokenAddress of basket.addresses) {
        const tokenId = `${tokenAddress.chainId}-${tokenAddress.address}`.toLowerCase();
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
