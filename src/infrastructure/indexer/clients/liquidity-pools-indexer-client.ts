import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { Network, NetworkUtils } from '@core/enums/network';
import { LiquidityPoolNotFoundError } from '@core/errors/liquidity-pool-not-found.error';
import { TokenNotFoundError } from '@core/errors/token-not-found-error';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { ILiquidityPoolOrder } from '@core/interfaces/liquidity-pool/liquidity-pool-order.interface';
import { ILiquidityPool } from '@core/interfaces/liquidity-pool/liquidity-pool.interface';
import { IProtocol } from '@core/interfaces/protocol.interface';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { LiquidityPoolsIndexerRequestAdapter } from '@infrastructure/indexer/adapters/liquidity-pools-indexer-request-adapter';
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
import { LiquidityPoolsIndexerResponseAdapter } from '../adapters/liquidity-pools-indexer-response-adapter';

@Injectable()
export class LiquidityPoolsIndexerClient {
  constructor(private readonly graphQLClients: GraphQLClients) {}

  async getAllSupportedDexs(): Promise<IProtocol[]> {
    const response = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      GetProtocolsQuery,
      GetProtocolsQueryVariables
    >(GetProtocolsDocument);

    return response.Protocol.map((protocol) => ({
      id: protocol.id,
      name: protocol.name,
      url: protocol.url,
      logoUrl: protocol.logo,
    }));
  }

  async getToken(chainId: Network, tokenAddress: string): Promise<ISingleChainToken> {
    const isSearchingForNative = tokenAddress === ZERO_ETHEREUM_ADDRESS;

    const tokens = await this.graphQLClients.liquidityPoolsIndexerClient.request<GetTokenQuery, GetTokenQueryVariables>(
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

  async getPool(poolAddress: string, chainId: Network): Promise<ILiquidityPool> {
    const poolsMatching = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      GetPoolsQuery,
      GetPoolsQueryVariables
    >(GetPoolsDocument, {
      poolsFilter: {
        id: { _eq: `${chainId}-${poolAddress.toLowerCase()}` },
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

    const pools = await this.graphQLClients.liquidityPoolsIndexerClient.request<GetPoolsQuery, GetPoolsQueryVariables>(
      GetPoolsDocument,
      {
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
    );

    return LiquidityPoolsIndexerResponseAdapter.responseToLiquidityPoolList(pools.Pool);
  }
}
