import 'src/core/extensions/string.extension';
import {
  GetPoolsQuery_query_root_Pool_Pool,
  GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData,
  GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData,
} from 'src/gen/graphql.gen';
import { PoolTotalStatsDTO } from '../dtos/pool-total-stats.dto';
import { Networks, NetworksUtils } from '../enums/networks';
import { getDaysAgoTimestamp } from './date-utils';
import { calculatePoolAPR, getPoolTotalStats, isLPDynamicFee, isWrappedNativePool } from './pool-utils';

describe('PoolUtils', () => {
  it("should calculate a liquidity pool APR from it's TVL and fees", () => {
    expect(calculatePoolAPR(100, 10)).toBe(3650);
  });

  it('should return true if the passed fee tier is the same as the dynamic fee tier flag number', () => {
    expect(isLPDynamicFee(0x800000)).toBe(true);
  });

  it('should return false if the passed fee tier is zero (whichi is not the dynamic fee tier flag number)', () => {
    expect(isLPDynamicFee(0)).toBe(false);
  });

  it('should return false if the passed fee tier is not the dynamic fee tier flag number', () => {
    expect(isLPDynamicFee(12719)).toBe(false);
  });

  it(`should sum all the data from the last 24 hours, calculate the APR
    based on the TVL and total fees summed, then return it as the 24h total stats
    when calling 'getPoolTotalStats'`, () => {
    const totalDailyData = [];
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = Array.from(
      { length: 24 },
      (_, index) =>
        ({
          feesUSD: '100',
          hourStartTimestamp: '1',
          liquidityNetInflowUSD: index % 2 === 0 ? '500' : '-800',
          swapVolumeUSD: '1000',
        }) as GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData,
    );
    const currentPoolTotalValueLockedUSD = 9000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);
    const expected24hStats: PoolTotalStatsDTO = {
      totalFees: 2400,
      totalNetInflow: -3600,
      totalVolume: 24000,
      yield: 9733.333333333334,
    };

    expect(totalStats.totalStats24h).toEqual(expected24hStats);
  });

  it(`should sum all the data from the last 7 days only, calculate the total APR
    based on the average of each day, then return it as the 7d total stats
    when calling 'getPoolTotalStats'`, () => {
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = [];
    const totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 30 },
      (_, index) => ({
        feesUSD: '100',
        dayStartTimestamp: getDaysAgoTimestamp(index).toString(),
        totalValueLockedUSD: ((index + 1) * 1000).toString(),
        liquidityNetInflowUSD: index % 2 === 0 ? '1000' : '-800',
        swapVolumeUSD: '1000',
      }),
    );

    const currentPoolTotalValueLockedUSD = 98000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);
    const expectedStats: PoolTotalStatsDTO = {
      totalFees: 700,
      totalNetInflow: 1600,
      totalVolume: 7000,
      yield: 1351.9897959183675,
    };

    expect(totalStats.totalStats7d).toEqual(expectedStats);
  });

  it(`should sum all the data from the last 30 days only, calculate the total APR
    based on the average of each day, then return it as the 30d total stats
    when calling 'getPoolTotalStats'`, () => {
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = [];
    const totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 30 },
      (_, index) => ({
        feesUSD: '9000',
        dayStartTimestamp: getDaysAgoTimestamp(index).toString(),
        totalValueLockedUSD: ((index + 1) * 1000).toString(),
        liquidityNetInflowUSD: index % 2 === 0 ? (index + 1 * 100).toString() : '-23027032',
        swapVolumeUSD: '325111',
      }),
    );

    const currentPoolTotalValueLockedUSD = 98000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);
    const expectedStats: PoolTotalStatsDTO = {
      totalFees: 270000,
      totalNetInflow: -345403770,
      totalVolume: 9753330,
      yield: 43745.10908357829,
    };

    expect(totalStats.totalStats30d).toEqual(expectedStats);
  });

  it(`should sum all the data from the last 90 days only, calculate the total APR
    based on the average of each day, then return it as the 90d total stats
    when calling 'getPoolTotalStats'`, () => {
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = [];
    const totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 90 },
      (_, index) => ({
        feesUSD: (index + 1 * 12881).toString(),
        dayStartTimestamp: getDaysAgoTimestamp(index).toString(),
        totalValueLockedUSD: ((index + 1) * 9992).toString(),
        liquidityNetInflowUSD: index % 2 === 0 ? (index + 1 * -100).toString() : (index + 1 * 999).toString(),
        swapVolumeUSD: (index + 1 * 21090).toString(),
      }),
    );

    const currentPoolTotalValueLockedUSD = 98000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);
    const expectedStats: PoolTotalStatsDTO = {
      totalFees: 1163295,
      totalNetInflow: 44460,
      totalVolume: 1902105,
      yield: 2660.6875409340187,
    };

    expect(totalStats.totalStats90d).toEqual(expectedStats);
  });

  it(`should calculate the average yield of 7 days by dividing its yields
    by 7, even if there are not fully 7 days of data`, () => {
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = [];
    const totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 4 },
      (_, index) => ({
        feesUSD: '1000',
        dayStartTimestamp: getDaysAgoTimestamp(index).toString(),
        totalValueLockedUSD: '1000',
        liquidityNetInflowUSD: '1000',
        swapVolumeUSD: '1000',
      }),
    );

    const currentPoolTotalValueLockedUSD = 98000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);

    expect(totalStats.totalStats7d.yield).toEqual(20857.14285714286);
  });

  it(`should calculate the average yield of 30 days by dividing its yields
    by 30, even if there are not fully 30 days of data`, () => {
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = [];
    const totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 18 },
      (_, index) => ({
        feesUSD: '1000',
        dayStartTimestamp: getDaysAgoTimestamp(index).toString(),
        totalValueLockedUSD: '1000',
        liquidityNetInflowUSD: '1000',
        swapVolumeUSD: '1000',
      }),
    );

    const currentPoolTotalValueLockedUSD = 98000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);

    expect(totalStats.totalStats30d.yield).toEqual(21900);
  });

  it(`should calculate the average yield of 90 days by dividing its yields
    by 90, even if there are not fully 90 days of data`, () => {
    const totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[] = [];
    const totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[] = Array.from(
      { length: 63 },
      (_, index) => ({
        feesUSD: '1000',
        dayStartTimestamp: getDaysAgoTimestamp(index).toString(),
        totalValueLockedUSD: '1000',
        liquidityNetInflowUSD: '1000',
        swapVolumeUSD: '1000',
      }),
    );

    const currentPoolTotalValueLockedUSD = 98000;

    const totalStats = getPoolTotalStats(totalDailyData, totalHourlyData, currentPoolTotalValueLockedUSD);
    expect(totalStats.totalStats90d.yield).toEqual(25550);
  });

  it(`should return true for 'isWrappedNativePool' if the passed pool has the address of the token0
    as the wrapped native address for the chain of the pool`, () => {
    const network = Networks.SEPOLIA;

    const pool: GetPoolsQuery_query_root_Pool_Pool = {
      chainId: network,
      createdAtTimestamp: '0',
      currentFeeTier: 21,
      dailyData: [],
      hourlyData: [],
      initialFeeTier: 21,
      poolAddress: '0x123',
      poolType: 'V3',
      positionManager: '21',
      totalValueLockedUSD: '0',
      token0: {
        tokenAddress: NetworksUtils.wrappedNativeAddress(network),
      },
      token1: {
        tokenAddress: '0x123',
      },
    };

    expect(isWrappedNativePool(pool)).toBe(true);
  });

  it(`should return true for 'isWrappedNativePool' if the passed pool has the address of the token1
    as the wrapped native address for the chain of the pool`, () => {
    const network = Networks.ETHEREUM;

    const pool: GetPoolsQuery_query_root_Pool_Pool = {
      chainId: network,
      createdAtTimestamp: '0',
      currentFeeTier: 21,
      dailyData: [],
      hourlyData: [],
      initialFeeTier: 21,
      poolAddress: '0x123',
      poolType: 'V3',
      positionManager: '21',
      totalValueLockedUSD: '0',
      token1: {
        tokenAddress: NetworksUtils.wrappedNativeAddress(network),
      },
      token0: {
        tokenAddress: '0xToko0',
      },
    };

    expect(isWrappedNativePool(pool)).toBe(true);
  });
});
