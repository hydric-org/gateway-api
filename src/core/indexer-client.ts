import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQuery_query_root_Pool_Pool,
  GetPoolsQueryVariables,
  GetProtocolsDocument,
  GetProtocolsQuery,
  GetProtocolsQuery_query_root_Protocol_Protocol,
  GetProtocolsQueryVariables,
  GetTokenDocument,
  GetTokenQuery,
  GetTokenQuery_query_root_Token_Token,
  GetTokenQueryVariables,
} from 'src/gen/graphql.gen';
import { ZERO_ETHEREUM_ADDRESS } from './constants';
import { PoolSearchFiltersDTO } from './dtos/pool-search-filters.dto';
import { Networks, NetworksUtils } from './enums/networks';
import { GraphQLClients } from './graphql-clients';
import { getPoolIntervalQueryFilters } from './utils/query-utils';

@Injectable()
export class IndexerClient {
  constructor(private readonly graphQLClients: GraphQLClients) {}

  async queryAllProtocols(): Promise<GetProtocolsQuery_query_root_Protocol_Protocol[]> {
    const response = await this.graphQLClients.indexerClient.request<GetProtocolsQuery, GetProtocolsQueryVariables>(
      GetProtocolsDocument,
    );

    return response.Protocol;
  }

  async querySingleToken(chainId: Networks, tokenAddress: string): Promise<GetTokenQuery_query_root_Token_Token> {
    const tokens = await this.graphQLClients.indexerClient.request<GetTokenQuery, GetTokenQueryVariables>(
      GetTokenDocument,
      {
        tokenFilter: {
          id: {
            _in: [
              `${chainId}-${tokenAddress}`.toLowerCase(),
              ...(tokenAddress === ZERO_ETHEREUM_ADDRESS
                ? [`${chainId}-${NetworksUtils.wrappedNativeAddress(chainId)}`]
                : []),
            ],
          },
        },
      },
    );

    if (tokens.Token.length === 0) {
      throw new InternalServerErrorException(
        `Token '${tokenAddress}' at '${chainId} chain' not found; maybe incorrect address or chain?`,
      );
    }

    return tokens.Token[0];
  }

  async querySinglePool(poolAddress: string, chainId: Networks): Promise<GetPoolsQuery_query_root_Pool_Pool> {
    const poolsMatching = await this.graphQLClients.indexerClient.request<GetPoolsQuery, GetPoolsQueryVariables>(
      GetPoolsDocument,
      {
        poolsFilter: {
          id: { _eq: `${chainId}-${poolAddress.toLowerCase()}` },
        },
        ...getPoolIntervalQueryFilters({
          minIntervalTVL: 1000,
        }),
      },
    );

    if (poolsMatching.Pool.length === 0) {
      throw new NotFoundException(
        `Pool '${poolAddress}' at '${chainId} chain' not found; maybe incorrect address or chain?`,
      );
    }

    return poolsMatching.Pool[0];
  }

  async queryPoolsForPairs(params: {
    token0AddressesPerChainId: Record<number, Set<string>>;
    token1AddressesPerChainId: Record<number, Set<string>>;
    searchFilters: PoolSearchFiltersDTO;
  }): Promise<GetPoolsQuery_query_root_Pool_Pool[]> {
    const token0AddressesChains = Object.keys(params.token0AddressesPerChainId);
    const token1AddressesChains = Object.keys(params.token1AddressesPerChainId);

    const indexerIdsToken0: string[] = token0AddressesChains
      .map((network) => {
        const addresses = Array.from(params.token0AddressesPerChainId[Number(network)]);
        return addresses.map((address) => `${network}-${address.toLowerCase()}`);
      })
      .flat();

    const indexerIdsToken1: string[] = token1AddressesChains
      .map((network) => {
        const addresses = Array.from(params.token1AddressesPerChainId[Number(network)]);
        return addresses.map((address) => `${network}-${address.toLowerCase()}`);
      })
      .flat();

    const poolsFilter: GetPoolsQueryVariables['poolsFilter'] = {
      protocol_id: {
        _nin: params.searchFilters.blockedProtocols,
      },
      poolType: {
        _nin: params.searchFilters.blockedPoolTypes,
      },
      totalValueLockedUSD: {
        _gt: params.searchFilters.minimumTvlUsd.toString(),
      },
      _or: [
        {
          token0_id: {
            _in: indexerIdsToken0,
          },
          token1_id: {
            _in: indexerIdsToken1,
          },
        },
        {
          token0_id: {
            _in: indexerIdsToken1,
          },
          token1_id: {
            _in: indexerIdsToken0,
          },
        },
      ],
    };

    const response = await this.graphQLClients.indexerClient.request<GetPoolsQuery, GetPoolsQueryVariables>(
      GetPoolsDocument,
      {
        poolsFilter: poolsFilter,
        ...getPoolIntervalQueryFilters({
          minIntervalTVL: params.searchFilters.minimumTvlUsd,
        }),
      },
    );

    return response.Pool;
  }
}
