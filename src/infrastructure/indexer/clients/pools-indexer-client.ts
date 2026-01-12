import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { Network, NetworkUtils } from '@core/enums/network';
import { PoolNotFoundError } from '@core/errors/pool-not-found.error';
import { TokenNotFoundError } from '@core/errors/token-not-found-error';
import { IPoolFilter } from '@core/interfaces/pool/pool-filter.interface';
import { IPoolOrder } from '@core/interfaces/pool/pool-order.interface';
import { IProtocol } from '@core/interfaces/protocol.interface';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { LiquidityPool } from '@core/types';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { PoolsIndexerRequestAdapter } from '@infrastructure/indexer/adapters/pools-indexer-request-adapter';
import { Injectable } from '@nestjs/common';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQueryVariables,
  GetProtocolsDocument,
  GetProtocolsQuery,
  GetProtocolsQueryVariables,
  GetTokenDocument,
  GetTokenQuery,
  GetTokenQueryVariables,
} from 'src/gen/graphql.gen';
import { PoolsIndexerResponseAdapter } from '../adapters/pools-indexer-response-adapter';

@Injectable()
export class PoolsIndexerClient {
  constructor(private readonly graphQLClients: GraphQLClients) {}

  async getAllSupportedDexs(): Promise<IProtocol[]> {
    const response = await this.graphQLClients.poolsIndexerClient.request<
      GetProtocolsQuery,
      GetProtocolsQueryVariables
    >(GetProtocolsDocument);

    return response.Protocol;
  }

  async getToken(chainId: Network, tokenAddress: string): Promise<ISingleChainToken> {
    const isSearchingForNative = tokenAddress === ZERO_ETHEREUM_ADDRESS;

    const tokens = await this.graphQLClients.poolsIndexerClient.request<GetTokenQuery, GetTokenQueryVariables>(
      GetTokenDocument,
      {
        tokenFilter: {
          id: {
            _in: [
              `${chainId}-${tokenAddress}`.toLowerCase(),
              ...(isSearchingForNative ? [`${chainId}-${NetworkUtils.wrappedNativeAddress(chainId)}`] : []),
            ],
          },
        },
      },
    );

    if (tokens.Token.length === 0) {
      throw new TokenNotFoundError({
        chainId: chainId,
        tokenAddress: tokenAddress,
      });
    }

    let token = tokens.Token[0];

    // this means that the network indexer has both native the wrapped native
    // so we return the actual requested token
    if (tokens.Token.length > 1 && isSearchingForNative) {
      token = tokens.Token.find((token) => token.id === `${chainId}-${tokenAddress.toLowerCase()}`)!;
    }

    return {
      address: token.tokenAddress,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
    };
  }

  async getPool(poolAddress: string, chainId: Network): Promise<LiquidityPool> {
    const poolsMatching = await this.graphQLClients.poolsIndexerClient.request<GetPoolsQuery, GetPoolsQueryVariables>(
      GetPoolsDocument,
      {
        poolsFilter: {
          id: { _eq: `${chainId}-${poolAddress.toLowerCase()}` },
        },
      },
    );

    if (poolsMatching.Pool.length === 0) {
      throw new PoolNotFoundError({
        chainId: chainId,
        poolAddress: poolAddress,
      });
    }

    return PoolsIndexerResponseAdapter.responseToLiquidityPoolList(poolsMatching.Pool)[0];
  }

  async getPools(params: {
    tokensA: string[];
    tokensB: string[];
    limit: number;
    skip: number;
    orderBy: IPoolOrder;
    filters: IPoolFilter;
  }): Promise<LiquidityPool[]> {
    const lowercasedTokensA = params.tokensA.map((addr) => addr.toLowerCase());
    const lowercasedTokensB = params.tokensB.map((addr) => addr.toLowerCase());

    const pools = await this.graphQLClients.poolsIndexerClient.request<GetPoolsQuery, GetPoolsQueryVariables>(
      GetPoolsDocument,
      {
        limit: params.limit,
        offset: params.skip,
        orderBy: PoolsIndexerRequestAdapter.poolOrderToIndexer(params.orderBy),
        poolsFilter: {
          protocol_id: { _nin: params.filters.blockedProtocols.map((p) => p.toLowerCase()) },
          poolType: { _nin: params.filters.blockedPoolTypes },
          trackedTotalValueLockedUsd: { _gte: params.filters.minimumTvlUsd.toString() },
          _or: [
            {
              ...(lowercasedTokensA.length > 0 && { token0_id: { _in: lowercasedTokensA } }),
              ...(lowercasedTokensB.length > 0 && { token1_id: { _in: lowercasedTokensB } }),
            },
            {
              ...(lowercasedTokensB.length > 0 && { token0_id: { _in: lowercasedTokensB } }),
              ...(lowercasedTokensA.length > 0 && { token1_id: { _in: lowercasedTokensA } }),
            },
          ],
        },
      },
    );

    return PoolsIndexerResponseAdapter.responseToLiquidityPoolList(pools.Pool);
  }
}
