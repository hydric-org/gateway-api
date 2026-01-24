import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolNotFoundError } from '@core/errors/liquidity-pool-not-found.error';
import { TokenNotFoundError } from '@core/errors/token-not-found-error';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { ILiquidityPoolOrder } from '@core/interfaces/liquidity-pool/liquidity-pool-order.interface';
import { ILiquidityPool } from '@core/interfaces/liquidity-pool/liquidity-pool.interface';
import { IProtocol } from '@core/interfaces/protocol.interface';
import { IIndexerToken } from '@core/interfaces/token/indexer-token.interface';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { ITokenFilter } from '@core/interfaces/token/token-filter.interface';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';
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
  GetTokensDocument,
  GetTokensQuery,
  GetTokensQueryVariables,
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

  async getTokens(params: {
    filter?: ITokenFilter;
    orderBy: ITokenOrder;
    limit?: number;
    skip?: number;
    chainId?: ChainId;
  }): Promise<IIndexerToken[]> {
    const response = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      GetTokensQuery,
      GetTokensQueryVariables
    >(GetTokensDocument, {
      tokenFilter: {
        chainId: {
          ...(params.chainId
            ? { _eq: params.chainId }
            : // TODO: remove this when sepolia is not supported anymore in the indexer
              { _neq: 11155111 }),
        },
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

        ...(params.filter?.symbols &&
          params.filter.symbols.length > 0 && {
            _or: [
              {
                normalizedSymbol:
                  params.filter.symbols.length === 1
                    ? { _eq: params.filter.symbols[0] }
                    : { _in: params.filter.symbols },
              },
              {
                symbol:
                  params.filter.symbols.length === 1
                    ? { _eq: params.filter.symbols[0] }
                    : { _in: params.filter.symbols },
              },
            ],
          }),
      },
      limit: params.limit,
      offset: params.skip,
      orderBy: LiquidityPoolsIndexerRequestAdapter.tokenOrderToIndexer(params.orderBy),
    });

    return LiquidityPoolsIndexerResponseAdapter.responseToIndexerTokenList(response.SingleChainToken);
  }

  async getToken(chainId: ChainId, tokenAddress: string): Promise<ISingleChainToken> {
    const isSearchingForNative = tokenAddress === ZERO_ETHEREUM_ADDRESS;

    const tokens = await this.graphQLClients.liquidityPoolsIndexerClient.request<
      GetTokensQuery,
      GetTokensQueryVariables
    >(GetTokensDocument, {
      tokenFilter: {
        id: {
          _in: [`${chainId}-${tokenAddress}`.toLowerCase()],
        },
      },
    });

    if (tokens.SingleChainToken.length === 0) {
      throw new TokenNotFoundError({
        chainId: chainId,
        tokenAddress: tokenAddress,
      });
    }

    let token = tokens.SingleChainToken[0];

    // this means that the network indexer has both native the wrapped native
    // so we return the actual requested token
    if (tokens.SingleChainToken.length > 1 && isSearchingForNative) {
      token = tokens.SingleChainToken.find((token) => token.id === `${chainId}-${tokenAddress.toLowerCase()}`)!;
    }

    return {
      address: token.tokenAddress,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
    };
  }

  async getPool(poolAddress: string, chainId: ChainId): Promise<ILiquidityPool> {
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
