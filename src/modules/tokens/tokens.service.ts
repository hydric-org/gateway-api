import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { IMultiChainToken } from '@core/interfaces/token/multi-chain-token.interface';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { LiquidityPoolsIndexerResponseAdapter } from '@infrastructure/indexer/adapters/liquidity-pools-indexer-response-adapter';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { MultiChainTokenListConfig } from '@lib/api/token/dtos/multi-chain-token-list-config.dto';
import { MultiChainTokenListCursor } from '@lib/api/token/dtos/multi-chain-token-list-cursor.dto';
import { SingleChainTokenListConfig } from '@lib/api/token/dtos/single-chain-token-list-config.dto';
import { SingleChainTokenListCursor } from '@lib/api/token/dtos/single-chain-token-list-cursor.dto';
import { BloomFilter } from '@lib/bloom-filter/bloom-filter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensService {
  constructor(private readonly liquidityPoolsIndexer: LiquidityPoolsIndexerClient) {}

  async getMultichainTokenList(
    listConfig: MultiChainTokenListConfig,
    listFilters: ITokenFilter,
  ): Promise<{ tokens: IMultiChainToken[]; nextCursor: string | null }> {
    return this.getMultichainTokens(listConfig, listFilters);
  }

  async searchMultichainTokens(
    search: string,
    listConfig: MultiChainTokenListConfig,
    listFilters: ITokenFilter,
  ): Promise<{ tokens: IMultiChainToken[]; nextCursor: string | null }> {
    return this.getMultichainTokens(listConfig, listFilters, search);
  }

  private async getMultichainTokens(
    listConfig: MultiChainTokenListConfig,
    listFilters: ITokenFilter,
    search?: string,
  ): Promise<{ tokens: IMultiChainToken[]; nextCursor: string | null }> {
    const getTopTokensBatchSize = listConfig.limit * 1.5;
    const multichainTokenList: IMultiChainToken[] = [];
    let pastTokensBloomFilter: BloomFilter;
    let getTopTokensSkipCount = 0;
    let hasMoreTokensToFetch = true;

    if (listConfig.cursor) {
      const decodedCursor = MultiChainTokenListCursor.decode(listConfig.cursor);

      pastTokensBloomFilter = BloomFilter.deserialize(
        decodedCursor.bloomFilterBits,
        decodedCursor.bitArraySize,
        decodedCursor.hashFunctionsCount,
      );

      getTopTokensSkipCount = decodedCursor.offset;
    } else pastTokensBloomFilter = new BloomFilter();

    while (multichainTokenList.length < listConfig.limit && hasMoreTokensToFetch) {
      const topSinglechainTokens = await this.liquidityPoolsIndexer.getTokens({
        limit: getTopTokensBatchSize,
        skip: getTopTokensSkipCount,
        orderBy: listConfig.orderBy,
        filter: listFilters,
        search,
      });

      if (topSinglechainTokens.length === 0) {
        hasMoreTokensToFetch = false;
        break;
      }

      if (topSinglechainTokens.length < getTopTokensBatchSize) hasMoreTokensToFetch = false;

      const topUniqueSymbols = [
        ...new Set(
          topSinglechainTokens
            .filter((token) => !pastTokensBloomFilter.has(token.id))
            .map((token) => token.normalizedSymbol),
        ),
      ];

      if (topUniqueSymbols.length === 0) {
        getTopTokensSkipCount += topSinglechainTokens.length;
        continue;
      }

      const allTokensMatchingTopSymbols = await this.liquidityPoolsIndexer.getTokens({
        filter: {
          symbols: topUniqueSymbols,
          ...listFilters,
        },
        orderBy: {
          direction: OrderDirection.DESC,
          field: TokenOrderField.TVL,
        },
      });

      const { multichainTokenList: batchMultichainTokenList, discardedTokens } =
        LiquidityPoolsIndexerResponseAdapter.indexerTokensToMultichainTokenList(allTokensMatchingTopSymbols, {
          matchAllSymbols: listConfig.matchAllSymbols,
          minimumPriceBackingUsd: listFilters.minimumPriceBackingUsd,
          minimumSwapVolumeUsd: listFilters.minimumSwapVolumeUsd,
          minimumSwapsCount: listFilters.minimumSwapsCount,
        });

      const multichainTokensToAdd = batchMultichainTokenList.slice(0, listConfig.limit - multichainTokenList.length);
      const lastAddedSymbol = multichainTokensToAdd[multichainTokensToAdd.length - 1]?.symbol;
      const batchCountUsed =
        multichainTokensToAdd.length === batchMultichainTokenList.length
          ? topSinglechainTokens.length
          : topSinglechainTokens.map((t) => t.symbol).lastIndexOf(lastAddedSymbol) + 1;

      getTopTokensSkipCount += batchCountUsed;
      multichainTokenList.push(...multichainTokensToAdd);

      for (const token of multichainTokensToAdd) {
        if (
          token.chainIds.length === 1 &&
          !discardedTokens.some((discardedToken) => discardedToken.symbol === token.symbol)
        ) {
          continue;
        }

        token.ids.forEach((id) => pastTokensBloomFilter.add(id));
      }

      for (const token of discardedTokens) pastTokensBloomFilter.add(token.id);
    }

    let nextCursorEncoded: string | null = null;

    if (multichainTokenList.length >= listConfig.limit) {
      const bloomFilterParams = pastTokensBloomFilter.getParams();

      const cursorData: MultiChainTokenListCursor = {
        bloomFilterBits: pastTokensBloomFilter.serialize(),
        offset: getTopTokensSkipCount,
        bitArraySize: bloomFilterParams.bitArraySize,
        hashFunctionsCount: bloomFilterParams.hashFunctionsCount,
      };

      nextCursorEncoded = MultiChainTokenListCursor.encode(cursorData);
    }

    return {
      tokens: multichainTokenList,
      nextCursor: nextCursorEncoded,
    };
  }

  async getSingleChainTokenList(
    chainId: ChainId,
    config: SingleChainTokenListConfig,
    filters: ITokenFilter,
  ): Promise<{ tokens: ISingleChainToken[]; nextCursor: string | null }> {
    const decodedCursor = SingleChainTokenListCursor.decode(config.cursor);

    const indexerTokens = await this.liquidityPoolsIndexer.getTokens({
      chainIds: [chainId],
      filter: filters,
      orderBy: config.orderBy,
      limit: config.limit,
      skip: decodedCursor.skip,
    });

    const tokens = indexerTokens.map((token) => ({
      chainId: token.chainId,
      address: token.address,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      logoUrl: TOKEN_LOGO(token.chainId, token.address),
    }));

    const nextCursor =
      tokens.length < config.limit
        ? null
        : SingleChainTokenListCursor.encode({
            ...decodedCursor,
            skip: decodedCursor.skip + config.limit,
          });

    return { tokens, nextCursor };
  }

  async searchSingleChainTokens(
    chainId: ChainId,
    search: string,
    config: SingleChainTokenListConfig,
    filters: ITokenFilter,
  ): Promise<{ tokens: ISingleChainToken[]; nextCursor: string | null }> {
    const decodedCursor = SingleChainTokenListCursor.decode(config.cursor);

    const indexerTokens = await this.liquidityPoolsIndexer.getTokens({
      chainIds: [chainId],
      filter: filters,
      orderBy: config.orderBy,
      limit: config.limit,
      skip: decodedCursor.skip,
      search,
    });

    const tokens = indexerTokens.map((token) => ({
      chainId: token.chainId,
      address: token.address,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      logoUrl: TOKEN_LOGO(token.chainId, token.address),
    }));

    const nextCursor =
      tokens.length < config.limit
        ? null
        : SingleChainTokenListCursor.encode({
            ...decodedCursor,
            skip: decodedCursor.skip + config.limit,
          });

    return { tokens, nextCursor };
  }

  async getTokensByAddress(tokenAddress: string, chainIds?: ChainId[]): Promise<ISingleChainToken[]> {
    const indexerTokens = await this.liquidityPoolsIndexer.getTokens({
      filter: {
        minimumTotalValuePooledUsd: 0,
        minimumPriceBackingUsd: 0,
        minimumSwapsCount: 0,
        minimumSwapVolumeUsd: 0,
      },
      orderBy: {
        field: TokenOrderField.TVL,
        direction: OrderDirection.DESC,
      },
      tokenAddress: tokenAddress.toLowerCase(),
      chainIds: chainIds,
    });

    return indexerTokens.map((token) => ({
      chainId: token.chainId,
      address: token.address,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      logoUrl: TOKEN_LOGO(token.chainId, token.address),
    }));
  }
}
