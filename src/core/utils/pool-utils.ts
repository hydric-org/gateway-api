import {
  GetPoolsQuery_query_root_Pool_Pool,
  GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData,
  GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData,
  Pool,
} from 'src/gen/graphql.gen';
import { PoolTotalStatsDTO } from '../dtos/pool-total-stats.dto';
import { NetworksUtils } from '../enums/networks';
import { getDaysAgoTimestamp } from './date-utils';

export function calculatePoolAPR(tvl: number, fees: number): number {
  return (fees / tvl) * 100 * 365;
}

export function isLPDynamicFee(initialPoolFeeTier: number): boolean {
  const dynamicFeeFlag = 0x800000;

  return initialPoolFeeTier === dynamicFeeFlag;
}

export function getPoolTotalStats(
  totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[],
  totalHourlyData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[],
  currentPoolTotalValueLockedUSD: number,
): {
  totalStats90d: PoolTotalStatsDTO;
  totalStats30d: PoolTotalStatsDTO;
  totalStats7d: PoolTotalStatsDTO;
  totalStats24h: PoolTotalStatsDTO;
} {
  return {
    totalStats24h: get24hPoolTotalStats(totalHourlyData, currentPoolTotalValueLockedUSD),
    ...getPoolTotalStatsFromDailyData(totalDailyData),
  };
}

export function isWrappedNativePool(pool: Pool | GetPoolsQuery_query_root_Pool_Pool): boolean {
  const isPoolToken0WrappedNative: boolean = pool.token0!.tokenAddress.lowercasedEquals(
    NetworksUtils.wrappedNativeAddress(pool.chainId),
  );

  const isPoolToken1WrappedNative: boolean = pool.token1!.tokenAddress.lowercasedEquals(
    NetworksUtils.wrappedNativeAddress(pool.chainId),
  );

  const isWrappedNativePool = isPoolToken0WrappedNative || isPoolToken1WrappedNative;
  return isWrappedNativePool;
}

export function get24hPoolTotalStats(
  last24hData: GetPoolsQuery_query_root_Pool_Pool_hourlyData_PoolHourlyData[],
  currentPoolTotalValueLockedUSD: number,
): PoolTotalStatsDTO {
  const totalStats24h: PoolTotalStatsDTO = {
    totalVolume: 0,
    totalFees: 0,
    yield: 0,
    totalNetInflow: 0,
  };

  last24hData.forEach((hourlyData) => {
    totalStats24h.totalFees += Number(hourlyData.feesUSD);
    totalStats24h.totalVolume += Number(hourlyData.swapVolumeUSD);
    totalStats24h.totalNetInflow += Number(hourlyData.liquidityNetInflowUSD);
  });

  totalStats24h.yield = calculatePoolAPR(currentPoolTotalValueLockedUSD, totalStats24h.totalFees);

  return totalStats24h;
}

export function getPoolTotalStatsFromDailyData(
  totalDailyData: GetPoolsQuery_query_root_Pool_Pool_dailyData_PoolDailyData[],
): {
  totalStats90d: PoolTotalStatsDTO;
  totalStats30d: PoolTotalStatsDTO;
  totalStats7d: PoolTotalStatsDTO;
} {
  const totalStats90d: PoolTotalStatsDTO = {
    totalVolume: 0,
    totalFees: 0,
    yield: 0,
    totalNetInflow: 0,
  };

  const totalStats30d: PoolTotalStatsDTO = {
    totalVolume: 0,
    totalFees: 0,
    yield: 0,
    totalNetInflow: 0,
  };

  const totalStats7d: PoolTotalStatsDTO = {
    totalVolume: 0,
    totalFees: 0,
    yield: 0,
    totalNetInflow: 0,
  };

  totalDailyData.forEach((dayData) => {
    const dayYield = calculatePoolAPR(Number(dayData.totalValueLockedUSD), Number(dayData.feesUSD));

    if (Number(dayData.dayStartTimestamp) > getDaysAgoTimestamp(7)) {
      totalStats7d.totalFees += Number(dayData.feesUSD);
      totalStats7d.totalVolume += Number(dayData.swapVolumeUSD);
      totalStats7d.totalNetInflow += Number(dayData.liquidityNetInflowUSD);
      totalStats7d.yield += dayYield;
    }

    if (Number(dayData.dayStartTimestamp) > getDaysAgoTimestamp(30)) {
      totalStats30d.totalFees += Number(dayData.feesUSD);
      totalStats30d.totalVolume += Number(dayData.swapVolumeUSD);
      totalStats30d.totalNetInflow += Number(dayData.liquidityNetInflowUSD);
      totalStats30d.yield += dayYield;
    }

    if (Number(dayData.dayStartTimestamp) > getDaysAgoTimestamp(90)) {
      totalStats90d.totalFees += Number(dayData.feesUSD);
      totalStats90d.totalVolume += Number(dayData.swapVolumeUSD);
      totalStats90d.totalNetInflow += Number(dayData.liquidityNetInflowUSD);
      totalStats90d.yield += dayYield;
    }
  });

  totalStats7d.yield /= 7;
  totalStats30d.yield /= 30;
  totalStats90d.yield /= 90;

  return { totalStats90d, totalStats30d, totalStats7d };
}
