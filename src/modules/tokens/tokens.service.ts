import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { IMultiChainTokenMetadata } from '@core/interfaces/token/multi-chain-token-metadata.interface';
import { ISingleChainTokenInfo } from '@core/interfaces/token/single-chain-token-info.interface';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { LiquidityPoolsIndexerResponseAdapter } from '@infrastructure/liquidity-pools-indexer/adapters/liquidity-pools-indexer-response-adapter';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { MultiChainTokenListConfig } from '@lib/api/token/dtos/multi-chain-token-list-config.dto';
import { MultiChainTokenListCursor } from '@lib/api/token/dtos/multi-chain-token-list-cursor.dto';
import { MultiChainTokenListFilter } from '@lib/api/token/dtos/multi-chain-token-list-filter.dto';
import { MultiChainTokenSearchFilter } from '@lib/api/token/dtos/multi-chain-token-search-filter.dto';
import { SingleChainTokenListConfig } from '@lib/api/token/dtos/single-chain-token-list-config.dto';
import { SingleChainTokenListCursor } from '@lib/api/token/dtos/single-chain-token-list-cursor.dto';
import { SingleChainTokenListFilter } from '@lib/api/token/dtos/single-chain-token-list-filter.dto';
import { SingleChainTokenSearchFilter } from '@lib/api/token/dtos/single-chain-token-search-filter.dto';
import { BloomFilter } from '@lib/bloom-filter/bloom-filter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensService {
  constructor(private readonly liquidityPoolsIndexer: LiquidityPoolsIndexerClient) {}

  async getMultichainTokenList(
    listConfig: MultiChainTokenListConfig,
    listFilters: MultiChainTokenListFilter,
  ): Promise<{ tokens: IMultiChainTokenMetadata[]; nextCursor: string | null }> {
    return this.getMultichainTokens(listConfig, listFilters);
  }

  async searchMultichainTokens(
    search: string,
    listConfig: MultiChainTokenListConfig,
    listFilters: MultiChainTokenSearchFilter,
  ): Promise<{ tokens: IMultiChainTokenMetadata[]; nextCursor: string | null }> {
    return this.getMultichainTokens(listConfig, listFilters, search);
  }

  private async getMultichainTokens(
    listConfig: MultiChainTokenListConfig,
    listFilters: ITokenFilter,
    search?: string,
  ): Promise<{ tokens: IMultiChainTokenMetadata[]; nextCursor: string | null }> {
    const getTopTokensBatchSize = Math.ceil(listConfig.limit * 1.5);
    const multichainTokenList: IMultiChainTokenMetadata[] = [];
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
      const topSinglechainTokensForAggregation = await this.liquidityPoolsIndexer.getTokensForMultichainAggregation({
        limit: getTopTokensBatchSize,
        skip: getTopTokensSkipCount,
        filter: listFilters,
        orderBy: listConfig.orderBy,
        search,
      });

      if (topSinglechainTokensForAggregation.length === 0) {
        hasMoreTokensToFetch = false;
        break;
      }

      if (topSinglechainTokensForAggregation.length < getTopTokensBatchSize) hasMoreTokensToFetch = false;

      const topUniqueSymbols = [
        ...new Set(
          topSinglechainTokensForAggregation
            .filter((token) => !pastTokensBloomFilter.has(token.id))
            .map((token) => token.normalizedSymbol),
        ),
      ];

      if (topUniqueSymbols.length === 0) {
        getTopTokensSkipCount += topSinglechainTokensForAggregation.length;
        continue;
      }

      const allTokensMatchingTopSymbols = await this.liquidityPoolsIndexer.getTokensForMultichainAggregation({
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
        LiquidityPoolsIndexerResponseAdapter.liquidityPoolsIndexerTokensToMultichainTokenList(
          allTokensMatchingTopSymbols,
          {
            matchAllSymbols: listConfig.matchAllSymbols,
            order: listConfig.orderBy,
          },
        );

      const multichainTokensToAdd = batchMultichainTokenList.slice(0, listConfig.limit - multichainTokenList.length);
      const lastAddedSymbol = multichainTokensToAdd[multichainTokensToAdd.length - 1]?.symbol;
      const batchCountUsed =
        multichainTokensToAdd.length === batchMultichainTokenList.length
          ? topSinglechainTokensForAggregation.length
          : topSinglechainTokensForAggregation.map((t) => t.symbol).lastIndexOf(lastAddedSymbol) + 1;

      getTopTokensSkipCount += batchCountUsed;
      multichainTokenList.push(...multichainTokensToAdd);

      for (const token of multichainTokensToAdd) {
        if (
          token.chainIds.length === 1 &&
          !discardedTokens.some((discardedToken) => discardedToken.symbol === token.symbol)
        ) {
          continue;
        }

        token.addresses.forEach((addr) => pastTokensBloomFilter.add(`${addr.chainId}-${addr.address}`));
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
    filters: SingleChainTokenListFilter,
  ): Promise<{ tokens: ISingleChainTokenMetadata[]; nextCursor: string | null }> {
    const decodedCursor = SingleChainTokenListCursor.decode(config.cursor);

    const indexerTokens = await this.liquidityPoolsIndexer.getSingleChainTokens({
      chainIds: [chainId],
      filter: filters,
      orderBy: config.orderBy,
      limit: config.limit,
      skip: decodedCursor.skip,
    });

    const tokens: ISingleChainTokenMetadata[] = indexerTokens.map((token) => ({
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
    filters: SingleChainTokenSearchFilter,
  ): Promise<{ tokens: ISingleChainTokenMetadata[]; nextCursor: string | null }> {
    const decodedCursor = SingleChainTokenListCursor.decode(config.cursor);

    const indexerTokens = await this.liquidityPoolsIndexer.getSingleChainTokens({
      chainIds: [chainId],
      filter: filters,
      orderBy: config.orderBy,
      limit: config.limit,
      skip: decodedCursor.skip,
      search,
    });

    const tokens: ISingleChainTokenMetadata[] = indexerTokens.map((token) => ({
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

  async getSingleChainTokenInfo(chainId: ChainId, tokenAddress: string): Promise<ISingleChainTokenInfo> {
    const token = await this.liquidityPoolsIndexer.getToken(chainId, tokenAddress);

    return {
      chainId: token.chainId,
      address: token.address,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      logoUrl: TOKEN_LOGO(token.chainId, token.address),
      totalValuePooledUsd: token.totalValuePooledUsd,
    };
  }

  async searchTokensByAddress(tokenAddress: string, chainIds?: ChainId[]): Promise<ISingleChainTokenMetadata[]> {
    const indexerTokens = await this.liquidityPoolsIndexer.getSingleChainTokens({
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
