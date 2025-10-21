import 'reflect-metadata';
import sinon from 'sinon';
import { ZERO_ETHEREUM_ADDRESS } from 'src/core/constants';
import { MultichainTokenDTO } from 'src/core/dtos/multi-chain-token.dto';
import { PoolSearchConfigDTO } from 'src/core/dtos/pool-search-config.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { PoolType } from 'src/core/enums/pool-type';
import { IndexerClient } from 'src/core/indexer-client';
import { RawQueryParser } from 'src/core/raw-query-parser';
import { TokenRepository } from 'src/core/repositories/token-repository';
import { LiquidityPool } from 'src/core/types';
import {
  GetPoolsQuery_query_root_Pool_Pool,
  GetPoolsQuery_query_root_Pool_Pool_algebraPoolData_AlgebraPoolData,
  GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData,
  GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData,
  GetPoolsQuery_query_root_Pool_Pool_v3PoolData_V3PoolData,
  GetPoolsQuery_query_root_Pool_Pool_v4PoolData_V4PoolData,
} from 'src/gen/graphql.gen';
import { PoolsService } from './pools.service';

describe('PoolsService', () => {
  let sut: PoolsService;
  let indexerClient: sinon.SinonStubbedInstance<IndexerClient>;
  let rawQueryParser: sinon.SinonStubbedInstance<RawQueryParser>;
  let tokenRepository: sinon.SinonStubbedInstance<TokenRepository>;

  const defaultPoolForQueryResponse = (customParams: {
    chainId?: number;
    poolType?: PoolType;
    token0Address?: string;
    token1Address?: string;
    v3PoolData?: GetPoolsQuery_query_root_Pool_Pool_v3PoolData_V3PoolData;
    v4PoolData?: GetPoolsQuery_query_root_Pool_Pool_v4PoolData_V4PoolData;
    algebraPoolData?: GetPoolsQuery_query_root_Pool_Pool_algebraPoolData_AlgebraPoolData;
    dailyData?: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[];
    hourlyData?: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[];
    poolAddress?: string;
    createdAtTimestamp?: string;
    currentFeeTier?: number;
    initialFeeTier?: number;
    totalValueLockedUSD?: string;
    protocol?: GetPoolsQuery_query_root_Pool_Pool['protocol'];
    positionManagerAddress?: string;
  }): GetPoolsQuery_query_root_Pool_Pool => ({
    chainId: customParams.chainId ?? 1,
    createdAtTimestamp: customParams.createdAtTimestamp ?? '1',
    currentFeeTier: customParams.currentFeeTier ?? 1,
    initialFeeTier: customParams.initialFeeTier ?? 1,
    dailyData: customParams.dailyData ?? [],
    hourlyData: customParams.hourlyData ?? [],
    v3PoolData: customParams.v3PoolData ?? {
      sqrtPriceX96: '1',
      tick: '1',
      tickSpacing: 1,
    },
    v4PoolData: customParams.v4PoolData ?? {
      sqrtPriceX96: '1',
      tick: '1',
      tickSpacing: 1,
      hooks: '0xhuks',
      permit2: '0xpermit2',
      poolManager: '0xpoolManager',
      stateView: '-x-stateView',
    },

    algebraPoolData: customParams.algebraPoolData ?? null,
    protocol: customParams.protocol ?? {
      name: 'protocol-name',
      url: 'protocol-url',
      id: 'protocol-id',
      logo: 'protocol-logo',
    },
    poolAddress: customParams.poolAddress ?? 'pool-address',
    poolType: customParams.poolType ?? 'V3',
    positionManager: customParams.positionManagerAddress ?? 'position-manager-address',
    totalValueLockedUSD: customParams.totalValueLockedUSD ?? '1',
    token0: {
      tokenAddress: customParams.token0Address ?? 'toko-0',
    },
    token1: {
      tokenAddress: customParams.token1Address ?? 'toko-1',
    },
  });

  const defaultParsedPool = (customParams: { poolAddress?: string }): LiquidityPool => ({
    chainId: defaultPoolForQueryResponse({}).chainId,
    createdAtTimestamp: Number(defaultPoolForQueryResponse({}).createdAtTimestamp),
    currentFeeTier: defaultPoolForQueryResponse({}).currentFeeTier,
    initialFeeTier: defaultPoolForQueryResponse({}).initialFeeTier,
    latestSqrtPriceX96: '1',
    latestTick: '1',
    poolAddress: customParams.poolAddress ?? defaultPoolForQueryResponse({}).poolAddress,
    poolType: defaultPoolForQueryResponse({}).poolType,
    positionManagerAddress: defaultPoolForQueryResponse({}).positionManager,
    tickSpacing: 1,
    totalValueLockedUSD: 1,
    deployerAddress: '0x0000000000000000000000000000000000000000',
    permit2Address: '0x0000000000000000000000000000000000000000',
    poolManagerAddress: '0x0000000000000000000000000000000000000000',
    stateViewAddress: '0x0000000000000000000000000000000000000000',
    total24hStats: {
      totalFees: 1,
      totalNetInflow: 1,
      totalVolume: 1,
      yield: 1,
    },
    total30dStats: {
      totalFees: 1,
      totalNetInflow: 1,
      totalVolume: 1,
      yield: 1,
    },
    total7dStats: {
      totalFees: 1,
      totalNetInflow: 1,
      totalVolume: 1,
      yield: 1,
    },
    total90dStats: {
      totalFees: 1,
      totalNetInflow: 1,
      totalVolume: 1,
      yield: 1,
    },
    hook: {
      address: '0x0000000000000000000000000000000000000000',
      isDynamicFee: false,
    },
    token0: {
      address: defaultPoolForQueryResponse({}).token0!.tokenAddress,
      decimals: 1,
      name: 'toko0',
      symbol: 'toko0s',
    },
    token1: {
      address: defaultPoolForQueryResponse({}).token1!.tokenAddress,
      decimals: 1,
      name: 'toko1',
      symbol: 'toko1s',
    },
    protocol: {
      id: defaultPoolForQueryResponse({}).protocol!.id,
      logo: defaultPoolForQueryResponse({}).protocol!.logo,
      name: defaultPoolForQueryResponse({}).protocol!.name,
      url: defaultPoolForQueryResponse({}).protocol!.url,
    },
  });

  beforeEach(() => {
    indexerClient = sinon.createStubInstance(IndexerClient);
    rawQueryParser = sinon.createStubInstance(RawQueryParser);
    tokenRepository = sinon.createStubInstance(TokenRepository);

    sut = new PoolsService(tokenRepository, indexerClient, rawQueryParser);

    tokenRepository.getMultichainTokensByIds.resolves([]);
    indexerClient.querySinglePool.resolves(defaultPoolForQueryResponse({}));
    indexerClient.queryPoolsForPairs.resolves([defaultPoolForQueryResponse({})]);
    rawQueryParser.parseRawPoolsQuery.resolves([defaultParsedPool({})]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`should use the indexer client to get a single pool when calling 'getPoolData'
    pass the response to the raw query parser, and then return the first parsed pool`, async () => {
    const network = Networks.ETHEREUM;
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const parseWrappedToNative = true;
    const indexerClientResponse: GetPoolsQuery_query_root_Pool_Pool = defaultPoolForQueryResponse({
      poolAddress: 'indexer-client-pool-address',
    });
    const expectedParsedPool = defaultParsedPool({
      poolAddress: 'indexer-client-pool-address',
    });

    indexerClient.querySinglePool.resolves(indexerClientResponse);
    rawQueryParser.parseRawPoolsQuery.resolves([expectedParsedPool]);

    const result = await sut.getPoolData(poolAddress, network, parseWrappedToNative);

    expect(result).toEqual(expectedParsedPool);

    sinon.assert.calledOnceWithExactly(indexerClient.querySinglePool, poolAddress, network);
    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, [indexerClientResponse]);
  });

  it(`should pass the parse wrapped to native true to the raw query parsers when calling
    'getPoolData' passing the parseWrappedToNative param true`, async () => {
    const network = Networks.ETHEREUM;
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const parseWrappedToNative = true;

    await sut.getPoolData(poolAddress, network, parseWrappedToNative);

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [network]: parseWrappedToNative,
      },
    });
  });

  it(`should pass the parse wrapped to native false to the raw query parsers when calling
    'getPoolData' passing the parseWrappedToNative param false`, async () => {
    const network = Networks.ETHEREUM;
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const parseWrappedToNative = false;

    await sut.getPoolData(poolAddress, network, parseWrappedToNative);

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [network]: parseWrappedToNative,
      },
    });
  });

  it(`should pass the return v4 wrapped native pools param true to the raw query
    parsers when calling 'getPoolData'`, async () => {
    const network = Networks.ETHEREUM;
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const parseWrappedToNative = false;

    await sut.getPoolData(poolAddress, network, parseWrappedToNative);

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      returnV4WrappedPoolsPerChain: {
        [network]: true,
      },
    });
  });

  it(`should call the indexer client to query pools for pairs passing
    the addresses 0 and 1 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko0', 'toko1', 'toko2', 'toko3'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      token0AddressesPerChainId: {
        [network]: new Set(token0Addresses),
      },
      token1AddressesPerChainId: {
        [network]: new Set(token1Addresses),
      },
    });
  });

  it(`should add the network wrapped native address to the tokens 0 addresses if calling
    "searchPoolsInChain" with zero address in the tokens 0, and then pass
    the addresses 0 with the wrapped native to the indexer client to query pools`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = [ZERO_ETHEREUM_ADDRESS, 'toko1', 'toko2', 'toko3'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    const expectedTokens0 = [...token0Addresses, NetworksUtils.wrappedNativeAddress(network)];

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      token0AddressesPerChainId: {
        [network]: new Set(expectedTokens0),
      },
    });
  });

  it(`should add the network wrapped native address to the tokens 1 addresses if calling
    "searchPoolsInChain" with zero address in the tokens 1, and then pass
    the addresses 1 with the wrapped native to the indexer client to query pools`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = [ZERO_ETHEREUM_ADDRESS, 'toko1', 'toko2', 'toko3'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    const expectedTokens1 = [...token1Addresses, NetworksUtils.wrappedNativeAddress(network)];

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      token1AddressesPerChainId: {
        [network]: new Set(expectedTokens1),
      },
    });
  });

  it(`should repass the passed filters to the indexer client query when calling "searchPoolsInChain"`, async () => {
    const filters: PoolSearchFiltersDTO = {
      blockedPoolTypes: [PoolType.V3],
      blockedProtocols: ['xbas'],
      minimumTvlUsd: 12896918,
    };

    await sut.searchPoolsInChain({
      network: Networks.ETHEREUM,
      token0Addresses: [],
      token1Addresses: [],
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: filters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      searchFilters: filters,
    });
  });

  it("should pass the response from the indexer client to the raw query parser when calling 'searchPoolsInChain'", async () => {
    const queryResponse = [
      defaultPoolForQueryResponse({
        poolAddress: '0x123',
      }),
    ];

    indexerClient.queryPoolsForPairs.resolves(queryResponse);

    await sut.searchPoolsInChain({
      network: Networks.ETHEREUM,
      token0Addresses: [],
      token1Addresses: [],
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithExactly(rawQueryParser.parseRawPoolsQuery, queryResponse, sinon.match.any);
  });

  it(`should pass to the query parser to parse wrapped to native as true when there's
    no wrapped native address in the tokens 0 or 1 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [network]: true,
      },
    });
  });

  it(`should pass to the query parser to not parse wrapped to native when there's
    the wrapped native address in the tokens 0 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = [NetworksUtils.wrappedNativeAddress(network), 'toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [network]: false,
      },
    });
  });

  it(`should pass to the query parser to not parse wrapped to native when there's
    the wrapped native address in the tokens 1 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = [NetworksUtils.wrappedNativeAddress(network), 'toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [network]: false,
      },
    });
  });

  it(`should pass to the query parser to return wrapped native v4 pools as true when there's
    the wrapped native address in the tokens 1 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = [NetworksUtils.wrappedNativeAddress(network), 'toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      returnV4WrappedPoolsPerChain: {
        [network]: true,
      },
    });
  });

  it(`should pass to the query parser to return wrapped native v4 pools as true when there's
    the wrapped native address in the tokens 0 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = [NetworksUtils.wrappedNativeAddress(network), 'toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      returnV4WrappedPoolsPerChain: {
        [network]: true,
      },
    });
  });

  it(`should pass to the query parser to not return wrapped native v4 pools when there's
    not wrapped native address in the tokens 0 or tokens 1 when calling "searchPoolsInChain"`, async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      returnV4WrappedPoolsPerChain: {
        [network]: false,
      },
    });
  });

  it("should return the pools from the query parser when calling 'searchPoolsInChain'", async () => {
    const network = Networks.ETHEREUM;
    const token0Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];
    const token1Addresses = ['toko4', 'toko5', 'toko6', 'toko7'];

    const expectedResult: LiquidityPool[] = [
      defaultParsedPool({
        poolAddress: '21',
      }),
      defaultParsedPool({
        poolAddress: '22-pool',
      }),
    ];

    rawQueryParser.parseRawPoolsQuery.resolves(expectedResult);

    const result = await sut.searchPoolsInChain({
      network,
      token0Addresses: token0Addresses,
      token1Addresses: token1Addresses,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });

    expect(result).toEqual(expectedResult);
  });

  it(`should request the token repository to get tokens by ids when calling 'searchPoolsCrossChain'
    for both token0Ids and token1Ids at once`, async () => {
    const token0Ids = ['xaxa', 'xuxu', 'lala'];
    const token1Ids = ['axax', 'uxux', 'alal'];

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(tokenRepository.getMultichainTokensByIds, token0Ids.concat(token1Ids));
  });

  it(`should return empty pools when calling 'searchPoolsCrossChain'
    and the token repository returns no tokens for the token ids`, async () => {
    tokenRepository.getMultichainTokensByIds.resolves([]);

    const result = await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: ['xaxa', 'xuxu'],
      token1Ids: ['xuxu', 'xdxd'],
    });

    expect(result).toEqual([]);
  });

  it(`should request the indexer client to query pools for pairs when calling 'searchPoolsCrossChain'
    passing all the addresses per chain from the tokens returned by the token repository when requested tokens by ids`, async () => {
    const token0Ids: string[] = ['kaka', 'lala'];
    const token1Ids: string[] = ['xaxa', 'tiata'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token0Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: '0x1',
          [Networks.UNICHAIN]: '0x2',
        } as Record<Networks, string>,
      },
      {
        id: token0Ids[1],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: '0x3',
          [Networks.UNICHAIN]: '0x4',
        } as Record<Networks, string>,
      },
      {
        id: token1Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: '0x5',
          [Networks.UNICHAIN]: '0x6',
        } as Record<Networks, string>,
      },
      {
        id: token1Ids[1],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: '0x7',
          [Networks.UNICHAIN]: '0x8',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      token0AddressesPerChainId: {
        [Networks.ETHEREUM]: new Set(['0x1', '0x3']),
        [Networks.UNICHAIN]: new Set(['0x2', '0x4']),
      },
      token1AddressesPerChainId: {
        [Networks.ETHEREUM]: new Set(['0x5', '0x7']),
        [Networks.UNICHAIN]: new Set(['0x6', '0x8']),
      },
    });
  });

  it(`Should add the wrapped native address to the token0 addresses if the token repository
    returns the native token for the token 0 ids when calling 'searchPoolsCrossChain'`, async () => {
    const token0Ids: string[] = ['kaka', 'lala'];
    const token1Ids: string[] = ['huhu', 'lulu'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token0Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: ZERO_ETHEREUM_ADDRESS,
          [Networks.UNICHAIN]: ZERO_ETHEREUM_ADDRESS,
        } as Record<Networks, string>,
      },
      {
        id: token0Ids[1],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: '0xNOT_NATIVE',
          [Networks.UNICHAIN]: '0xNOT_NAVLITE',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      token0AddressesPerChainId: {
        [Networks.ETHEREUM]: new Set([
          ZERO_ETHEREUM_ADDRESS,
          tokens[1].addresses[Networks.ETHEREUM],
          NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
        ]),
        [Networks.UNICHAIN]: new Set([
          ZERO_ETHEREUM_ADDRESS,
          tokens[1].addresses[Networks.UNICHAIN],
          NetworksUtils.wrappedNativeAddress(Networks.UNICHAIN),
        ]),
      },
    });
  });

  it(`Should add the wrapped native address to the token1 addresses if the token repository
    returns the native token for the token 1 ids when calling 'searchPoolsCrossChain'`, async () => {
    const token0Ids: string[] = ['kaka', 'lala'];
    const token1Ids: string[] = ['jaja', 'yaya'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token1Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: ZERO_ETHEREUM_ADDRESS,
          [Networks.UNICHAIN]: ZERO_ETHEREUM_ADDRESS,
        } as Record<Networks, string>,
      },
      {
        id: token1Ids[1],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: '0xNOT_NATIVE',
          [Networks.UNICHAIN]: '0xNOT_NAVLITE',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      token1AddressesPerChainId: {
        [Networks.ETHEREUM]: new Set([
          ZERO_ETHEREUM_ADDRESS,
          tokens[1].addresses[Networks.ETHEREUM],
          NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
        ]),
        [Networks.UNICHAIN]: new Set([
          ZERO_ETHEREUM_ADDRESS,
          tokens[1].addresses[Networks.UNICHAIN],
          NetworksUtils.wrappedNativeAddress(Networks.UNICHAIN),
        ]),
      },
    });
  });

  it(`should repass the search filters to the indexer client
    to query pairs when calling 'searchPoolsCrossChain'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      minimumTvlUsd: 8781,
    };

    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['kaka'];

    tokenRepository.getMultichainTokensByIds.resolves([
      {
        id: token0Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: ZERO_ETHEREUM_ADDRESS,
          [Networks.UNICHAIN]: ZERO_ETHEREUM_ADDRESS,
        } as Record<Networks, string>,
      },
    ]);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters,
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.queryPoolsForPairs, {
      searchFilters: searchFilters,
    });
  });

  it(`should pass the resulf of the indexer query to the query parser
      when calling 'searchPoolsCrossChain'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      minimumTvlUsd: 8781,
    };

    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['kaka'];

    tokenRepository.getMultichainTokensByIds.resolves([
      {
        id: token0Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: ZERO_ETHEREUM_ADDRESS,
          [Networks.UNICHAIN]: ZERO_ETHEREUM_ADDRESS,
        } as Record<Networks, string>,
      },
    ]);

    const queryResponse = [
      defaultPoolForQueryResponse({
        poolAddress: 'pulo-address',
      }),
    ];

    indexerClient.queryPoolsForPairs.resolves(queryResponse);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters,
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, queryResponse);
  });

  it(`should pass to parse wrapped to native false to some chains and true to
    others when calling 'searchPoolsCrossChain' with some tokens 0 that are
    native and some that are not`, async () => {
    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['jaja'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token0Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.ETHEREUM]: ZERO_ETHEREUM_ADDRESS,
          [Networks.UNICHAIN]: '0xNOT_NATIVE',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [Networks.ETHEREUM]: true,
        [Networks.UNICHAIN]: undefined,
      },
    });
  });

  it(`should pass to parse wrapped to native false to some chains and true to
    others when calling 'searchPoolsCrossChain' with some tokens 1 that are
    native and some that are not`, async () => {
    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['jaja'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token1Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.BASE]: ZERO_ETHEREUM_ADDRESS,
          [Networks.HYPER_EVM]: '0xNOT_NATIVE',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      parseWrappedToNativePerChain: {
        [Networks.BASE]: true,
        [Networks.HYPER_EVM]: undefined,
      },
    });
  });

  it(`should pass to return v4 wrapped pools false to some chains and true to
    others when calling 'searchPoolsCrossChain' with some tokens 1 that are
    wrapped native and some that are not`, async () => {
    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['jaja'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token1Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.BASE]: NetworksUtils.wrappedNativeAddress(Networks.BASE),
          [Networks.HYPER_EVM]: '0xNOT_WRAPPED_NATIVE',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      returnV4WrappedPoolsPerChain: {
        [Networks.BASE]: true,
        [Networks.HYPER_EVM]: undefined,
      },
    });
  });

  it(`should pass to return v4 wrapped pools false to some chains and true to
    others when calling 'searchPoolsCrossChain' with some tokens 0 that are
    wrapped native and some that are not`, async () => {
    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['jaja'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token0Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.SCROLL]: NetworksUtils.wrappedNativeAddress(Networks.SCROLL),
          [Networks.PLASMA]: '0xNOT_WRAPPED_NATIVE',
        } as Record<Networks, string>,
      },
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);

    await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    sinon.assert.calledOnceWithMatch(rawQueryParser.parseRawPoolsQuery, sinon.match.any, {
      returnV4WrappedPoolsPerChain: {
        [Networks.SCROLL]: true,
        [Networks.PLASMA]: undefined,
      },
    });
  });

  it("should return the result of the query parser when calling 'searchPoolsCrossChain'", async () => {
    const token0Ids: string[] = ['kaka'];
    const token1Ids: string[] = ['kaka'];

    const tokens: MultichainTokenDTO[] = [
      {
        id: token1Ids[0],
        name: '',
        symbol: '',
        decimals: {
          [Networks.BASE]: 18,
        } as Record<Networks, number>,
        addresses: {
          [Networks.BASE]: ZERO_ETHEREUM_ADDRESS,
        } as Record<Networks, string>,
      },
    ];

    const expectedParsedPools = [
      defaultParsedPool({
        poolAddress: '0x21 POol',
      }),
    ];

    tokenRepository.getMultichainTokensByIds.resolves(tokens);
    rawQueryParser.parseRawPoolsQuery.resolves(expectedParsedPools);

    const result = await sut.searchPoolsCrossChain({
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
      token0Ids: token0Ids,
      token1Ids: token1Ids,
    });

    expect(result).toEqual(expectedParsedPools);
  });
});
