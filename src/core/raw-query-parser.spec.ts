import sinon from 'sinon';
import {
  GetPoolsQuery_query_root_Pool_Pool,
  GetPoolsQuery_query_root_Pool_Pool_algebraPoolData_AlgebraPoolData,
  GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData,
  GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData,
  GetPoolsQuery_query_root_Pool_Pool_v3PoolData_V3PoolData,
  GetPoolsQuery_query_root_Pool_Pool_v4PoolData_V4PoolData,
} from 'src/gen/graphql.gen';
import { ZERO_ETHEREUM_ADDRESS } from './constants';
import { PoolTotalStatsDTO } from './dtos/pool-total-stats.dto';
import { Networks, NetworksUtils } from './enums/networks';
import { PoolType } from './enums/pool-type';
import { RawQueryParser } from './raw-query-parser';
import { TokenRepository } from './repositories/token-repository';
import * as PoolUtils from './utils/pool-utils';

describe('RawQueryParser', () => {
  let sut: RawQueryParser;
  let tokenRepository: sinon.SinonStubbedInstance<TokenRepository>;
  const defaultPoolForResponse = (customParams: {
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

  beforeEach(() => {
    tokenRepository = sinon.createStubInstance(TokenRepository);
    sut = new RawQueryParser(tokenRepository);

    tokenRepository.getManyTokensFromManyNetworks.resolves({
      ...NetworksUtils.values().reduce(
        (acc, network) => ({
          ...acc,
          [network]: {
            [NetworksUtils.wrappedNativeAddress(network)]: {
              name: 'wrapped-native-name',
              symbol: 'wrapped-native-symbol',
              address: NetworksUtils.wrappedNativeAddress(network),
              decimals: 18,
              logoUrl: 'wrapped-native-logo-url',
            },
            [ZERO_ETHEREUM_ADDRESS]: {
              name: 'native-name',
              symbol: 'native-symbol',
              address: ZERO_ETHEREUM_ADDRESS,
              decimals: 18,
              logoUrl: 'native-logo-url',
            },
            'toko-0': {
              name: 'toko-0-name',
              symbol: 'toko-0-symbol',
              address: 'toko-0-address',
              decimals: 18,
              logoUrl: 'toko-0-logo-url',
            },
            'toko-1': {
              address: 'toko-1',
              name: 'toko-1-name',
              symbol: 'toko-1-symbol',
              decimals: 18,
              logoUrl: 'toko-1-logo',
            },
          },
        }),
        {},
      ),
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`should parse all wrapped native tokens to native (except in v4 pools)
    and return the tokens as native when calling 'parseRawPoolsQuery' passing a list of pools
    with wrapped natives and parseWrappedToNative set to true`, async () => {
    const network = Networks.ETHEREUM;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        chainId: network,
        token0Address: NetworksUtils.wrappedNativeAddress(1),
        token1Address: 'toko-1',
        poolType: PoolType.V3,
      }),
      defaultPoolForResponse({
        chainId: network,
        token0Address: 'toko-0',
        token1Address: NetworksUtils.wrappedNativeAddress(1),
        poolType: PoolType.V4,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: { 1: true },
      returnV4WrappedPoolsPerChain: { 1: true },
    });

    expect(parsedPools[0].token0.address).toEqual(ZERO_ETHEREUM_ADDRESS);
    expect(parsedPools[1].token1.address).toEqual(NetworksUtils.wrappedNativeAddress(1));
  });

  it(`should not parse wrapped native tokens to native
    when calling 'parseRawPoolsQuery' passing a list of pools
    with wrapped natives and parseWrappedToNative set to false`, async () => {
    const network = Networks.ETHEREUM;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        chainId: network,
        token0Address: NetworksUtils.wrappedNativeAddress(1),
        poolType: PoolType.V3,
      }),
      defaultPoolForResponse({
        chainId: network,
        token1Address: NetworksUtils.wrappedNativeAddress(1),
        poolType: PoolType.V4,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: { 1: false },
      returnV4WrappedPoolsPerChain: { 1: true },
    });

    expect(parsedPools[0].token0.address).toEqual(NetworksUtils.wrappedNativeAddress(1));
    expect(parsedPools[1].token1.address).toEqual(NetworksUtils.wrappedNativeAddress(1));
  });

  it(`should parse some wrapped native tokens to native and others not
    when calling 'parseRawPoolsQuery' passing a list of pools
    with wrapped natives and parseWrappedToNative set to true for some networks
    and false for others`, async () => {
    const network1 = Networks.ETHEREUM;
    const network2 = Networks.BASE;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        chainId: network1,
        token0Address: NetworksUtils.wrappedNativeAddress(network1),
        poolType: PoolType.V3,
      }),
      defaultPoolForResponse({
        chainId: network2,
        token1Address: NetworksUtils.wrappedNativeAddress(network2),
        poolType: PoolType.V3,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: { [network1]: false, [network2]: true },
      returnV4WrappedPoolsPerChain: { 1: true },
    });

    expect(parsedPools[0].token0.address).toEqual(NetworksUtils.wrappedNativeAddress(network1));
    expect(parsedPools[1].token1.address).toEqual(ZERO_ETHEREUM_ADDRESS);
  });

  it(`should parse some wrapped native tokens to native and others not
    when calling 'parseRawPoolsQuery' passing a list of pools
    with wrapped natives and parseWrappedToNative set to true for some networks
    and false for others`, async () => {
    const network1 = Networks.ETHEREUM;
    const network2 = Networks.BASE;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        chainId: network1,
        token0Address: NetworksUtils.wrappedNativeAddress(network1),
        poolType: PoolType.V3,
      }),
      defaultPoolForResponse({
        chainId: network2,
        token1Address: NetworksUtils.wrappedNativeAddress(network2),
        poolType: PoolType.V3,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: { [network1]: false, [network2]: true },
      returnV4WrappedPoolsPerChain: { 1: true },
    });

    expect(parsedPools[0].token0.address).toEqual(NetworksUtils.wrappedNativeAddress(network1));
    expect(parsedPools[1].token1.address).toEqual(ZERO_ETHEREUM_ADDRESS);
  });

  it(`it should not return v4 pools with wrapped native as token0 or token1when calling 'parseRawPoolsQuery'
    passing wrapped native pools and returnV4WrappedPoolsPerChain set to false`, async () => {
    const network = Networks.BASE;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        chainId: network,
        token0Address: NetworksUtils.wrappedNativeAddress(network),
        poolType: PoolType.V4,
      }),
      defaultPoolForResponse({
        chainId: network,
        token1Address: NetworksUtils.wrappedNativeAddress(network),
        poolType: PoolType.V4,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {}, // assuming set to false if not set
    });

    expect(parsedPools.length).toEqual(0);
  });

  it(`it should return some v4 pools with wrapped native as token0 or token1 and some not
    when calling 'parseRawPoolsQuery' passing wrapped native pools and returnV4WrappedPoolsPerChain
    set to false to some networks and true to others`, async () => {
    const network1 = Networks.BASE;
    const network2 = Networks.SEPOLIA;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolAddress: 'purr 1',
        chainId: network1,
        token0Address: NetworksUtils.wrappedNativeAddress(network1),
        poolType: PoolType.V4,
      }),
      defaultPoolForResponse({
        poolAddress: 'puro pool 2',
        chainId: network2,
        token1Address: NetworksUtils.wrappedNativeAddress(network2),
        poolType: PoolType.V4,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {
        [network1]: true,
        [network2]: false,
      },
    });

    expect(parsedPools[0].poolAddress).toEqual(poolsQueryResponse[0].poolAddress);
  });

  it(`it should return the same chain id as the pool in the query response
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedNetwork = Networks.UNICHAIN;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        chainId: expectedNetwork,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].chainId).toEqual(expectedNetwork);
  });

  it(`it should return the same pool address as the pool in the query response
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedPoolAddress = 'purr 1';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolAddress: expectedPoolAddress,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].poolAddress).toEqual(expectedPoolAddress);
  });

  it(`it should return the same created at timestamp as the pool in the query response
    parsed to number when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedTimestamp = '090909011';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        createdAtTimestamp: expectedTimestamp,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].createdAtTimestamp).toEqual(Number(expectedTimestamp));
  });

  it(`it should return the same total value locked usd as the pool in the query response
    parsed to number when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedTotalValueLocked = '2170929179281.21';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        totalValueLockedUSD: expectedTotalValueLocked,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].totalValueLockedUSD).toEqual(Number(expectedTotalValueLocked));
  });

  it(`it should return the same pool type as the pool in the query response
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedPoolType = PoolType.V3;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: expectedPoolType,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].poolType).toEqual(expectedPoolType);
  });

  it(`it should return the same initial fee tier as the pool in the query response
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedInitialFeeTier = 1;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        initialFeeTier: expectedInitialFeeTier,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].initialFeeTier).toEqual(expectedInitialFeeTier);
  });

  it(`it should return the same fee tier as the pool in the query response
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedFeeTier = 1;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        currentFeeTier: expectedFeeTier,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].currentFeeTier).toEqual(expectedFeeTier);
  });

  it(`it should return the same position manager address as the pool
    in the query response when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedPositionManagerAddress = '0x12311aa';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        positionManagerAddress: expectedPositionManagerAddress,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].positionManagerAddress).toEqual(expectedPositionManagerAddress);
  });

  it(`it should return the same protocol object as the pool
    in the query response when passing the query response to
    'parseRawPoolsQuery'`, async () => {
    const expectedProtocol: GetPoolsQuery_query_root_Pool_Pool['protocol'] = {
      id: 'sushiswap',
      name: 'sushiswap',
      url: 'https://sushiswap.com',
      logo: 'https://sushiswap.com/logo.png',
    };

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        protocol: expectedProtocol,
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].protocol).toEqual(expectedProtocol);
  });

  it(`it should return the same tick spacing as the pool
    in the query response if the pool type is V3
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedTickSpacing = 89;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V3,
        v3PoolData: {
          sqrtPriceX96: '21',
          tick: '-1',
          tickSpacing: expectedTickSpacing,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].tickSpacing).toEqual(expectedTickSpacing);
  });

  it(`it should return the same tick spacing as the pool
    in the query response if the pool type is V4
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedTickSpacing = 89;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '21',
          tick: '-1',
          tickSpacing: expectedTickSpacing,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].tickSpacing).toEqual(expectedTickSpacing);
  });

  it(`it should return the same sqrtPriceX96 as the pool
    in the query response if the pool type is V3
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedSqrtPriceX96 = '125187251871212891111';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V3,
        v3PoolData: {
          sqrtPriceX96: expectedSqrtPriceX96,
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].latestSqrtPriceX96).toEqual(expectedSqrtPriceX96);
  });

  it(`it should return the same sqrtPriceX96 as the pool
    in the query response if the pool type is V4
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedSqrtPriceX96 = '999273982538725381719';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: expectedSqrtPriceX96,
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].latestSqrtPriceX96).toEqual(expectedSqrtPriceX96);
  });

  it(`it should return the same tick as the pool
    in the query response if the pool type is V3
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedTick = '1209172916218962192169';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V3,
        v3PoolData: {
          sqrtPriceX96: '121',
          tick: expectedTick,
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].latestTick).toEqual(expectedTick);
  });

  it(`it should return the same tick as the pool
    in the query response if the pool type is V4
    when passing the query response to 'parseRawPoolsQuery'`, async () => {
    const expectedTick = '1209172916218962192169';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '121',
          tick: expectedTick,
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].latestTick).toEqual(expectedTick);
  });

  it(`should return the same deployer address as the one from the query response in the
    algebra pool data when passing the query response to 'parseRawPoolsQuery' with the
    pool type V3 and the algebra pool data non null`, async () => {
    const expectedDeployerAddress = '0x7713d6a433e0c0b9123fc813ccb2a0daa3e0b6d1';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V3,
        algebraPoolData: {
          deployer: expectedDeployerAddress,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].deployerAddress).toEqual(expectedDeployerAddress);
  });

  it(`should return the same permit2 address as the one from the query response in the
    v4 pool data when passing the query response to 'parseRawPoolsQuery' with the
    pool type V4 `, async () => {
    const expectedPermit2Address = '0xPermiso2';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: expectedPermit2Address,
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].permit2Address).toEqual(expectedPermit2Address);
  });

  it(`should return the same pool manager address as the one from the query response in the
    v4 pool data when passing the query response to 'parseRawPoolsQuery' with the
    pool type V4 `, async () => {
    const expectedPoolManagerAddress = '0xPuloManager';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: expectedPoolManagerAddress,
          stateView: '',
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].poolManagerAddress).toEqual(expectedPoolManagerAddress);
  });

  it(`should return the same state view address as the one from the query response in the
    v4 pool data when passing the query response to 'parseRawPoolsQuery' with the
    pool type V4 `, async () => {
    const expectedStateViewAddress = '0xStateView';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: expectedStateViewAddress,
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].stateViewAddress).toEqual(expectedStateViewAddress);
  });

  it(`should return the state view address as null if the query response does not have
    it in the v4 pool data when passing the query response to 'parseRawPoolsQuery' with the
    pool type V4 `, async () => {
    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: undefined,
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].stateViewAddress).toEqual(null);
  });

  it(`should return null as hook if the query response has hooks with address zero
    when passing the query response to 'parseRawPoolsQuery' with the pool type V4`, async () => {
    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: ZERO_ETHEREUM_ADDRESS,
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].hook).toEqual(null);
  });

  it(`should return the hook address if the query response has hooks with non zero address
    when passing the query response to 'parseRawPoolsQuery' with the pool type V4`, async () => {
    const expectedHookAddress = '0xHulk';

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        v4PoolData: {
          hooks: expectedHookAddress,
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].hook!.address).toEqual(expectedHookAddress);
  });

  it(`shouuld return true for isDynamicFee if the pool at the query response has the initial fee tier
    of 0x800000 when passing the query response to 'parseRawPoolsQuery' with the pool type V4`, async () => {
    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        initialFeeTier: 0x800000,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].hook?.isDynamicFee).toEqual(true);
  });

  it(`shouuld return false for isDynamicFee if the pool at the query response has the initial fee tier
    different than 0x800000 when passing the query response to 'parseRawPoolsQuery' with the pool type V4`, async () => {
    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        poolType: PoolType.V4,
        initialFeeTier: 0x101010,
        v4PoolData: {
          hooks: '',
          permit2: '',
          poolManager: '',
          stateView: '',
          sqrtPriceX96: '121',
          tick: '-1',
          tickSpacing: 89,
        },
      }),
    ];

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].hook?.isDynamicFee).toEqual(false);
  });

  it(`should use the 'getPoolTotalStats' helper to calculate the total stats when calling 'parseRawPoolsQuery'
    and return the total stats in the pool`, async () => {
    const expected90dTotalStats: PoolTotalStatsDTO = {
      totalFees: 999999,
      totalNetInflow: -1212.322,
      totalVolume: 1027186281921,
      yield: 8882.221,
    };
    const expected7dTotalStats: PoolTotalStatsDTO = {
      totalFees: 12906121,
      totalNetInflow: 217201201,
      totalVolume: 1191991991919,
      yield: 0.001,
    };
    const expected30dTotalStats: PoolTotalStatsDTO = {
      totalFees: 192071092,
      totalNetInflow: -19919191.21,
      totalVolume: 9992269,
      yield: 211,
    };

    const expected24hTotalStats: PoolTotalStatsDTO = {
      totalFees: 883883.3322,
      totalNetInflow: 45545387,
      totalVolume: 0.000021,
      yield: 0.000001,
    };

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [defaultPoolForResponse({})];

    sinon.stub(PoolUtils, 'getPoolTotalStats').returns({
      totalStats90d: expected90dTotalStats,
      totalStats7d: expected7dTotalStats,
      totalStats30d: expected30dTotalStats,
      totalStats24h: expected24hTotalStats,
    });

    const parsedPools = await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    expect(parsedPools[0].total24hStats).toEqual(expected24hTotalStats);
    expect(parsedPools[0].total7dStats).toEqual(expected7dTotalStats);
    expect(parsedPools[0].total30dStats).toEqual(expected30dTotalStats);
    expect(parsedPools[0].total90dStats).toEqual(expected90dTotalStats);
  });

  it(`should pass the correct daily data, hourly data and tvl to the 'getPoolTotalStats'
    helper when calling 'parseRawPoolsQuery'`, async () => {
    const expectedDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 90 },
      (_, index) => ({
        feesUSD: index.toString(),
        liquidityNetInflowUSD: index.toString(),
        swapVolumeUSD: index.toString(),
        totalValueLockedUSD: index.toString(),
        dayStartTimestamp: index.toString(),
      }),
    );

    const expectedHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = Array.from(
      { length: 24 },
      (_, index) => ({
        feesUSD: (index * 24).toString(),
        liquidityNetInflowUSD: (index * 24).toString(),
        swapVolumeUSD: (index * 24).toString(),
        hourStartTimestamp: (index * 24).toString(),
      }),
    );

    const expectedTvl: number = 18259182189;

    const poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[] = [
      defaultPoolForResponse({
        dailyData: expectedDailyData,
        hourlyData: expectedHourlyData,
        totalValueLockedUSD: expectedTvl.toString(),
      }),
    ];

    const spy = sinon.spy(PoolUtils, 'getPoolTotalStats');

    await sut.parseRawPoolsQuery(poolsQueryResponse, {
      parseWrappedToNativePerChain: {},
      returnV4WrappedPoolsPerChain: {},
    });

    sinon.assert.calledOnceWithExactly(spy, expectedDailyData, expectedHourlyData, expectedTvl);
  });
});
