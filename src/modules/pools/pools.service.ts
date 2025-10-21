import { Injectable } from '@nestjs/common';
import { ZERO_ETHEREUM_ADDRESS } from 'src/core/constants';
import { PoolSearchConfigDTO } from 'src/core/dtos/pool-search-config.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { PoolDTO } from 'src/core/dtos/pool.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { IndexerClient } from 'src/core/indexer-client';
import { RawQueryParser } from 'src/core/raw-query-parser';
import { TokenRepository } from 'src/core/repositories/token-repository';
import { LiquidityPool } from 'src/core/types';
import { extractNetworkAddressFromTokens } from 'src/core/utils/multi-chain-token-utils';

@Injectable()
export class PoolsService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly indexerClient: IndexerClient,
    private readonly rawQueryParser: RawQueryParser,
  ) {}

  async getPoolData(poolAddress: string, chainId: number, parseWrappedToNative: boolean): Promise<PoolDTO> {
    const pool = await this.indexerClient.querySinglePool(poolAddress, chainId);

    const parsedPool = await this.rawQueryParser.parseRawPoolsQuery([pool], {
      parseWrappedToNativePerChain: { [chainId]: parseWrappedToNative },
      returnV4WrappedPoolsPerChain: { [chainId]: true },
    });

    return parsedPool[0];
  }

  async searchPoolsInChain(params: {
    token0Addresses: string[];
    token1Addresses: string[];
    network: Networks;
    searchConfig: PoolSearchConfigDTO;
    searchFilters: PoolSearchFiltersDTO;
  }): Promise<LiquidityPool[]> {
    const wrappedNativeAddress = NetworksUtils.wrappedNativeAddress(params.network);
    const search0Addresses = new Set(params.token0Addresses);
    const search1Addresses = new Set(params.token1Addresses);

    const isUserSearchingForWrappedNative =
      search0Addresses.has(wrappedNativeAddress) || search1Addresses.has(wrappedNativeAddress);

    if (params.token0Addresses.includes(ZERO_ETHEREUM_ADDRESS)) {
      search0Addresses.add(NetworksUtils.wrappedNativeAddress(params.network));
    }

    if (params.token1Addresses.includes(ZERO_ETHEREUM_ADDRESS)) {
      search1Addresses.add(NetworksUtils.wrappedNativeAddress(params.network));
    }

    const poolsQueryResponse = await this.indexerClient.queryPoolsForPairs({
      searchFilters: params.searchFilters,
      token0AddressesPerChainId: {
        [params.network]: search0Addresses,
      },
      token1AddressesPerChainId: {
        [params.network]: search1Addresses,
      },
    });

    const matchedPools = await this.rawQueryParser.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: { [params.network]: !isUserSearchingForWrappedNative },
      returnV4WrappedPoolsPerChain: { [params.network]: isUserSearchingForWrappedNative },
    });

    return matchedPools;
  }

  async searchPoolsCrossChain(params: {
    token0Ids: string[];
    token1Ids: string[];
    searchFilters: PoolSearchFiltersDTO;
    searchConfig: PoolSearchConfigDTO;
  }): Promise<LiquidityPool[]> {
    const searchTokens = await this.tokenRepository.getMultichainTokensByIds(params.token0Ids.concat(params.token1Ids));
    const searchTokens0 = searchTokens.filter((token) => params.token0Ids.includes(token.id));
    const searchTokens1 = searchTokens.filter((token) => params.token1Ids.includes(token.id));

    const searchNetworks = NetworksUtils.values().filter((network) => {
      if (!params.searchConfig.testnetMode && NetworksUtils.isTestnet(network)) return false;

      return searchTokens.some((token) => token?.addresses[network]?.hasValue());
    });

    if (searchNetworks.length === 0) return [];

    const searchToken0AddressesPerChainId: Record<number, Set<string>> = {};
    const searchToken1AddressesPerChainId: Record<number, Set<string>> = {};
    const parseWrappedToNativePerChainId: Record<number, boolean> = {};
    const returnV4WrappedPoolsPerChainId: Record<number, boolean> = {};

    searchNetworks.forEach((network) => {
      const wrappedNativeAddress = NetworksUtils.wrappedNativeAddress(network);
      const token0AddressesRequestedAtNetwork = extractNetworkAddressFromTokens(searchTokens0, network);
      const token1AddressesRequestedAtNetwork = extractNetworkAddressFromTokens(searchTokens1, network);

      searchToken0AddressesPerChainId[network] = new Set(...[token0AddressesRequestedAtNetwork]);
      searchToken1AddressesPerChainId[network] = new Set(...[token1AddressesRequestedAtNetwork]);

      if (
        token0AddressesRequestedAtNetwork.includes(wrappedNativeAddress) ||
        token1AddressesRequestedAtNetwork.includes(wrappedNativeAddress)
      ) {
        returnV4WrappedPoolsPerChainId[network] = true;
      }

      if (token0AddressesRequestedAtNetwork.includes(ZERO_ETHEREUM_ADDRESS)) {
        searchToken0AddressesPerChainId[network].add(NetworksUtils.wrappedNativeAddress(network));
        parseWrappedToNativePerChainId[network] = true;
      }

      if (token1AddressesRequestedAtNetwork.includes(ZERO_ETHEREUM_ADDRESS)) {
        searchToken1AddressesPerChainId[network].add(NetworksUtils.wrappedNativeAddress(network));
        parseWrappedToNativePerChainId[network] = true;
      }
    });

    const poolsQueryResponse = await this.indexerClient.queryPoolsForPairs({
      token0AddressesPerChainId: searchToken0AddressesPerChainId,
      token1AddressesPerChainId: searchToken1AddressesPerChainId,
      searchFilters: params.searchFilters,
    });

    const matchedPools = await this.rawQueryParser.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: parseWrappedToNativePerChainId,
      returnV4WrappedPoolsPerChain: returnV4WrappedPoolsPerChainId,
    });

    return matchedPools;
  }
}
