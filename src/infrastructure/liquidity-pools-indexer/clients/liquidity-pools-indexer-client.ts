import { TOKEN_LOGO } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
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
    filter?: ITokenFilter;
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
    filter?: ITokenFilter;
    orderBy?: ITokenOrder;
    limit?: number;
    skip?: number;
    chainIds?: ChainId[];
    search?: string;
    tokenAddress?: string;
    ids?: string[];
  }): Promise<ILiquidityPoolsIndexerSingleChainToken[]> {
    const response = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetSingleChainTokensQuery,
      LiquidityPoolsIndexerGetSingleChainTokensQueryVariables
    >({
      document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
      variables: {
        tokenFilter: this._buildTokenFilter(params),
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
            _eq: `${chainId}-${tokenAddress}`.toLowerCase(),
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

  async getPool(poolAddress: string, chainId: ChainId): Promise<ILiquidityPool> {
    const poolsMatching = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      LiquidityPoolsIndexerGetPoolsQuery,
      LiquidityPoolsIndexerGetPoolsQueryVariables
    >({
      document: LiquidityPoolsIndexerGetPoolsDocument,
      variables: {
        poolsFilter: {
          id: { _eq: `${chainId}-${poolAddress.toLowerCase()}` },
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
  }): Promise<ILiquidityPool[]> {
    const lowercasedTokensAIds = params.tokensA.map((addr) => `${addr.chainId}-${addr.address.toLowerCase()}`);
    const lowercasedTokensBIds = params.tokensB.map((addr) => `${addr.chainId}-${addr.address.toLowerCase()}`);

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
          protocol_id: { _nin: params.filters.blockedProtocols.map((p) => p.toLowerCase()) },
          poolType: { _nin: params.filters.blockedPoolTypes },
          trackedTotalValueLockedUsd: { _gte: params.filters.minimumTotalValueLockedUsd.toString() },
          _or: [
            {
              ...(lowercasedTokensAIds.length > 0 && { token0_id: { _in: lowercasedTokensAIds } }),
              ...(lowercasedTokensBIds.length > 0 && { token1_id: { _in: lowercasedTokensBIds } }),
            },
            {
              ...(lowercasedTokensBIds.length > 0 && { token0_id: { _in: lowercasedTokensBIds } }),
              ...(lowercasedTokensAIds.length > 0 && { token1_id: { _in: lowercasedTokensAIds } }),
            },
          ],
        },
      },
    });

    return LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList(pools.Pool);
  }

  private _buildTokenFilter(params: {
    filter?: ITokenFilter;
    chainIds?: ChainId[];
    search?: string;
    tokenAddress?: string;
    ids?: string[];
  }): SingleChainToken_Bool_Exp {
    return {
      chainId: {
        ...(params.chainIds && {
          _in: params.chainIds.length > 1 ? params.chainIds : undefined,
          _eq: params.chainIds.length === 1 ? params.chainIds[0] : undefined,
        }),
      },

      ...(params.ids && {
        id: { _in: params.ids },
      }),

      ...(params.filter?.minimumTotalValuePooledUsd && {
        trackedTotalValuePooledUsd: { _gt: params.filter.minimumTotalValuePooledUsd.toString() },
      }),

      swapsCount: {
        _gt: params.filter?.minimumSwapsCount.toString(),
      },

      trackedPriceDiscoveryCapitalUsd: {
        _gt: params.filter?.minimumPriceBackingUsd.toString(),
      },

      trackedSwapVolumeUsd: {
        _gt: params.filter?.minimumSwapVolumeUsd.toString(),
      },

      ...(params.search && {
        _or: [
          { name: { _ilike: `%${params.search}%` } },
          { normalizedName: { _ilike: `%${params.search}%` } },
          { symbol: { _ilike: `%${params.search}%` } },
          { normalizedSymbol: { _ilike: `%${params.search}%` } },
        ],
      }),

      ...(params.tokenAddress && {
        tokenAddress: { _eq: params.tokenAddress },
      }),

      ...(params.filter?.symbols &&
        params.filter.symbols.length > 0 && {
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
        }),
    };
  }
}
