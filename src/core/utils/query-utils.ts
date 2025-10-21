import { GetPoolsQueryVariables } from 'src/gen/graphql.gen';
import { YIELD_DAILY_DATA_LIMIT } from '../constants';
import { getDaysAgoTimestamp, yesterdayStartSecondsTimestamp } from './date-utils';

export function getPoolIntervalQueryFilters(params: { minIntervalTVL: number }): {
  dailyDataFilter: GetPoolsQueryVariables['dailyDataFilter'];
  hourlyDataFilter: GetPoolsQueryVariables['hourlyDataFilter'];
} {
  return {
    dailyDataFilter: {
      totalValueLockedUSD: {
        _gt: params.minIntervalTVL.toString(),
      },
      dayStartTimestamp: {
        _gt: getDaysAgoTimestamp(YIELD_DAILY_DATA_LIMIT).toString(),
      },
    },
    hourlyDataFilter: {
      totalValueLockedUSD: {
        _gt: params.minIntervalTVL.toString(),
      },
      hourStartTimestamp: {
        _gt: yesterdayStartSecondsTimestamp().toString(),
      },
    },
  };
}
