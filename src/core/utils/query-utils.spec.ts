import { GetPoolsQueryVariables } from 'src/gen/graphql.gen';
import { YIELD_DAILY_DATA_LIMIT } from '../constants';
import { getDaysAgoTimestamp, yesterdayStartSecondsTimestamp } from './date-utils';
import { getPoolIntervalQueryFilters } from './query-utils';

describe('QueryUtils', () => {
  it(`should correctly return the query filters for getting interval pool data,
    assigning the min tvl usd for each day/hour object`, () => {
    const minTvlUsd = 100;

    const result = getPoolIntervalQueryFilters({
      minIntervalTVL: minTvlUsd,
    });

    const expectedResult: {
      dailyDataFilter: GetPoolsQueryVariables['dailyDataFilter'];
      hourlyDataFilter: GetPoolsQueryVariables['hourlyDataFilter'];
    } = {
      dailyDataFilter: {
        totalValueLockedUSD: {
          _gt: minTvlUsd.toString(),
        },
        dayStartTimestamp: {
          _gt: getDaysAgoTimestamp(YIELD_DAILY_DATA_LIMIT).toString(),
        },
      },
      hourlyDataFilter: {
        totalValueLockedUSD: {
          _gt: minTvlUsd.toString(),
        },
        hourStartTimestamp: {
          _gt: yesterdayStartSecondsTimestamp().toString(),
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
