import { TOKEN_LOGO, ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { ChainId, ChainIdUtils } from '@core/enums/chain-id';
import { ParseWrappedToNative } from '@core/enums/parse-wrapped-to-native.enum';
import { LiquidityPoolNotFoundError } from '@core/errors/liquidity-pool-not-found.error';
import { TokenNotFoundError } from '@core/errors/token-not-found-error';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { ILiquidityPoolOrder } from '@core/interfaces/liquidity-pool/liquidity-pool-order.interface';
import { ILiquidityPool } from '@core/interfaces/liquidity-pool/liquidity-pool.interface';
import { IProtocol } from '@core/interfaces/protocol.interface';
import { ILiquidityPoolsIndexerSingleChainToken } from '@core/interfaces/token/liquidity-pools-indexer-single-chain-token.interface';
import { ILiquidityPoolsIndexerTokenForMultichainAggregation } from '@core/interfaces/token/liquidity-pools-indexer-token-for-multichain-aggregation.interface';
import { ISingleChainTokenInfo } from '@core/interfaces/token/single-chain-token-info.interface';
import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';
import { TokenUtils } from '@core/token/token-utils';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { LiquidityPoolsIndexerRequestAdapter } from '@infrastructure/liquidity-pools-indexer/adapters/liquidity-pools-indexer-request-adapter';
import { Injectable } from '@nestjs/common';
import {
  LiquidityPoolsIndexerGetPoolsDocument,
  LiquidityPoolsIndexerGetPoolsQuery,
  LiquidityPoolsIndexerGetPoolsQueryVariables,
  LiquidityPoolsIndexerGetProtocolsDocument,
  LiquidityPoolsIndexerGetProtocolsQuery,
  LiquidityPoolsIndexerGetProtocolsQueryVariables,
  LiquidityPoolsIndexerGetSingleChainTokensDocument,
  LiquidityPoolsIndexerGetSingleChainTokensQuery,
  LiquidityPoolsIndexerGetSingleChainTokensQueryVariables,
  LiquidityPoolsIndexerGetTokenInfoDocument,
  LiquidityPoolsIndexerGetTokenInfoQuery,
  LiquidityPoolsIndexerGetTokenInfoQueryVariables,
  LiquidityPoolsIndexerGetTokenPriceDocument,
  LiquidityPoolsIndexerGetTokenPriceQuery,
  LiquidityPoolsIndexerGetTokenPriceQueryVariables,
  LiquidityPoolsIndexerGetTokensForMultichainAggregationDocument,
  LiquidityPoolsIndexerGetTokensForMultichainAggregationQuery,
  LiquidityPoolsIndexerGetTokensForMultichainAggregationQueryVariables,
  SingleChainToken_Bool_Exp,
} from 'src/gen/graphql.gen';
import { LiquidityPoolsIndexerResponseAdapter } from '../adapters/liquidity-pools-indexer-response-adapter';

@Injectable()
export class LiquidityPoolsIndexerClient {
  constructor(private readonly graphQLClients: GraphQLClients) {}

  async getAllSupportedDexs(): Promise<IProtocol[]> {
    const response = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetProtocolsQuery,
      LiquidityPoolsIndexerGetProtocolsQueryVariables
    >({ document: LiquidityPoolsIndexerGetProtocolsDocument, variables: {} });

    return response.Protocol.map((protocol) => ({
      id: protocol.id,
      name: protocol.name,
      url: protocol.url,
      logoUrl: protocol.logo,
    }));
  }

  async getTokensForMultichainAggregation(params: {
    filter?: ITokenFilter & { symbols?: string[] };
    limit?: number;
    skip?: number;
    search?: string;
    orderBy: ITokenOrder;
  }): Promise<ILiquidityPoolsIndexerTokenForMultichainAggregation[]> {
    const response = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetTokensForMultichainAggregationQuery,
      LiquidityPoolsIndexerGetTokensForMultichainAggregationQueryVariables
    >({
      document: LiquidityPoolsIndexerGetTokensForMultichainAggregationDocument,
      variables: {
        tokenFilter: this._buildTokenFilter(params),
        limit: params.limit,
        offset: params.skip,
        orderBy: params.orderBy ? LiquidityPoolsIndexerRequestAdapter.tokenOrderToIndexer(params.orderBy) : undefined,
      },
    });

    return LiquidityPoolsIndexerResponseAdapter.responseToTokenForMultichainList(response);
  }

  async getSingleChainTokens(params: {
    filter?: ITokenFilter & { symbols?: string[] };
    orderBy?: ITokenOrder;
    limit?: number;
    skip?: number;
    search?: string;
    tokenAddress?: string;
    ids?: string[];
  }): Promise<ILiquidityPoolsIndexerSingleChainToken[]> {
    const tokenFilter = this._buildTokenFilter(params);

    const response = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetSingleChainTokensQuery,
      LiquidityPoolsIndexerGetSingleChainTokensQueryVariables
    >({
      document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
      variables: {
        tokenFilter: tokenFilter,
        limit: params.limit,
        offset: params.skip,
        ...(params.orderBy && {
          orderBy: LiquidityPoolsIndexerRequestAdapter.tokenOrderToIndexer(params.orderBy),
        }),
      },
    });

    response.SingleChainToken = response.SingleChainToken.filter((token) => Number(token.usdPrice) > 0);
    return LiquidityPoolsIndexerResponseAdapter.responseToSingleChainTokenList(response);
  }

  async getToken(chainId: ChainId, tokenAddress: string): Promise<ISingleChainTokenInfo> {
    const tokens = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetTokenInfoQuery,
      LiquidityPoolsIndexerGetTokenInfoQueryVariables
    >({
      document: LiquidityPoolsIndexerGetTokenInfoDocument,
      variables: {
        tokenFilter: {
          id: {
            _eq: TokenUtils.buildTokenId(chainId, tokenAddress),
          },
        },
      },
    });

    if (tokens.SingleChainToken.length === 0) {
      throw new TokenNotFoundError({
        chainId: chainId,
        tokenAddress: tokenAddress,
      });
    }

    const token = tokens.SingleChainToken[0];

    return {
      chainId: token.chainId,
      address: token.tokenAddress,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      logoUrl: TOKEN_LOGO(token.chainId, token.tokenAddress),
      totalValuePooledUsd: Number(token.trackedTotalValuePooledUsd),
    };
  }

  async getTokenPrice(chainId: ChainId, tokenAddress: string): Promise<number> {
    const tokenIds = [TokenUtils.buildTokenId(chainId, tokenAddress)];

    if (tokenAddress === ZERO_ETHEREUM_ADDRESS) {
      const wrappedAddress = ChainIdUtils.wrappedNativeAddress[chainId];

      tokenIds.push(TokenUtils.buildTokenId(chainId, wrappedAddress));
    }

    const response: LiquidityPoolsIndexerGetTokenPriceQuery =
      await this.graphQLClients.liquidityPoolsIndexerClient.request<
        LiquidityPoolsIndexerGetTokenPriceQuery,
        LiquidityPoolsIndexerGetTokenPriceQueryVariables
      >({
        document: LiquidityPoolsIndexerGetTokenPriceDocument,
        variables: {
          tokenFilter: {
            id: { _in: tokenIds },
          },
        },
      });

    if (!response || !response.SingleChainToken || response.SingleChainToken.length === 0) {
      throw new TokenNotFoundError({
        chainId: chainId,
        tokenAddress: tokenAddress,
      });
    }

    const requestedId = TokenUtils.buildTokenId(chainId, tokenAddress);
    const foundToken = response.SingleChainToken.find((t) => t.id === requestedId) || response.SingleChainToken[0];

    return Number(foundToken.trackedUsdPrice);
  }

  async getPool(poolAddress: string, chainId: ChainId): Promise<ILiquidityPool> {
    const poolsMatching = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetPoolsQuery,
      LiquidityPoolsIndexerGetPoolsQueryVariables
    >({
      document: LiquidityPoolsIndexerGetPoolsDocument,
      variables: {
        poolsFilter: {
          id: { _eq: TokenUtils.buildTokenId(chainId, poolAddress) },
        },
      },
    });

    if (poolsMatching.Pool.length === 0) {
      throw new LiquidityPoolNotFoundError({
        chainId: chainId,
        poolAddress: poolAddress,
      });
    }

    return LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList(poolsMatching.Pool)[0];
  }

  async getPools(params: {
    tokensA: IBlockchainAddress[];
    tokensB: IBlockchainAddress[];
    limit: number;
    skip: number;
    orderBy: ILiquidityPoolOrder;
    filters: ILiquidityPoolFilter;
    parseWrappedToNative: ParseWrappedToNative;
    useWrappedForNative: boolean;
  }): Promise<ILiquidityPool[]> {
    const tokensAIdsSet = new Set<string>();
    const tokensBIdsSet = new Set<string>();

    for (const tokenAddress of params.tokensA) {
      tokensAIdsSet.add(TokenUtils.buildTokenId(tokenAddress.chainId, tokenAddress.address));

      if (params.useWrappedForNative && tokenAddress.address === ZERO_ETHEREUM_ADDRESS) {
        tokensAIdsSet.add(
          TokenUtils.buildTokenId(tokenAddress.chainId, ChainIdUtils.wrappedNativeAddress[tokenAddress.chainId]),
        );
      }
    }

    for (const tokenAddress of params.tokensB) {
      tokensBIdsSet.add(TokenUtils.buildTokenId(tokenAddress.chainId, tokenAddress.address));

      if (params.useWrappedForNative && tokenAddress.address === ZERO_ETHEREUM_ADDRESS) {
        tokensBIdsSet.add(
          TokenUtils.buildTokenId(tokenAddress.chainId, ChainIdUtils.wrappedNativeAddress[tokenAddress.chainId]),
        );
      }
    }

    const tokensAIdsArray = Array.from(tokensAIdsSet);
    const tokensBIdsArray = Array.from(tokensBIdsSet);

    const pools = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetPoolsQuery,
      LiquidityPoolsIndexerGetPoolsQueryVariables
    >({
      document: LiquidityPoolsIndexerGetPoolsDocument,
      variables: {
        limit: params.limit,
        offset: params.skip,
        orderBy: LiquidityPoolsIndexerRequestAdapter.poolOrderToIndexer(params.orderBy),
        poolsFilter: {
          protocol_id:
            params.filters.protocols.length > 0
              ? { _in: params.filters.protocols.map((p) => p.toLowerCase()) }
              : { _nin: params.filters.blockedProtocols.map((p) => p.toLowerCase()) },

          poolType:
            params.filters.poolTypes.length > 0
              ? { _in: params.filters.poolTypes }
              : { _nin: params.filters.blockedPoolTypes },

          trackedTotalValueLockedUsd: { _gte: params.filters.minimumTotalValueLockedUsd.toString() },

          _or: [
            {
              ...(tokensAIdsArray.length > 0 && { token0_id: { _in: tokensAIdsArray } }),
              ...(tokensBIdsArray.length > 0 && { token1_id: { _in: tokensBIdsArray } }),
            },
            {
              ...(tokensBIdsArray.length > 0 && { token0_id: { _in: tokensBIdsArray } }),
              ...(tokensAIdsArray.length > 0 && { token1_id: { _in: tokensAIdsArray } }),
            },
          ],
        },
      },
    });

    const poolsList = LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList(pools.Pool);

    switch (params.parseWrappedToNative) {
      case ParseWrappedToNative.NEVER:
        return poolsList;
      case ParseWrappedToNative.ALWAYS:
        return LiquidityPoolsIndexerResponseAdapter.parseWrappedToNative(poolsList);
      case ParseWrappedToNative.AUTO: {
        return poolsList.map((pool) => {
          const nativeTokenKey = TokenUtils.buildTokenId(pool.chainId, ZERO_ETHEREUM_ADDRESS);
          const hasNativeSearch = tokensAIdsSet.has(nativeTokenKey) || tokensBIdsSet.has(nativeTokenKey);

          return hasNativeSearch ? LiquidityPoolsIndexerResponseAdapter.parseWrappedToNative([pool])[0] : pool;
        });
      }
    }
  }

  private _buildTokenFilter(params: {
    filter?: ITokenFilter & { symbols?: string[] };
    search?: string;
    tokenAddress?: string;
    ids?: string[];
  }): SingleChainToken_Bool_Exp {
    const conditions: SingleChainToken_Bool_Exp[] = [];

    if (params.filter?.chainIds && params.filter.chainIds.length > 0) {
      conditions.push({
        chainId:
          params.filter.chainIds.length === 1 ? { _eq: params.filter.chainIds[0] } : { _in: params.filter.chainIds },
      });
    }

    if (params.ids && params.ids.length > 0) {
      conditions.push({
        id: { _in: params.ids },
      });
    }

    if (params.filter?.ignoreWrappedNative) {
      conditions.push({
        id: {
          _nin: ChainIdUtils.values().map((chainId) =>
            TokenUtils.buildTokenId(chainId, ChainIdUtils.wrappedNativeAddress[chainId]),
          ),
        },
      });
    }

    if (params.filter?.minimumTotalValuePooledUsd !== undefined) {
      conditions.push({
        trackedTotalValuePooledUsd: { _gt: params.filter.minimumTotalValuePooledUsd.toString() },
      });
    }

    if (params.filter?.minimumSwapsCount !== undefined) {
      conditions.push({
        swapsCount: { _gt: params.filter.minimumSwapsCount.toString() },
      });
    }

    if (params.filter?.minimumSwapVolumeUsd !== undefined) {
      conditions.push({
        trackedSwapVolumeUsd: { _gt: params.filter.minimumSwapVolumeUsd.toString() },
      });
    }

    if (params.search) {
      conditions.push({
        _or: [
          { name: { _ilike: `%${params.search}%` } },
          { normalizedName: { _ilike: `%${params.search}%` } },
          { symbol: { _ilike: `%${params.search}%` } },
          { normalizedSymbol: { _ilike: `%${params.search}%` } },
        ],
      });
    }

    if (params.tokenAddress) {
      conditions.push({
        tokenAddress: { _eq: params.tokenAddress },
      });
    }

    if (params.filter?.symbols && params.filter.symbols.length > 0) {
      conditions.push({
        _or: [
          {
            normalizedSymbol:
              params.filter.symbols.length === 1 ? { _eq: params.filter.symbols[0] } : { _in: params.filter.symbols },
          },
          {
            symbol:
              params.filter.symbols.length === 1 ? { _eq: params.filter.symbols[0] } : { _in: params.filter.symbols },
          },
        ],
      });
    }

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];

    return { _and: conditions };
  }
}
