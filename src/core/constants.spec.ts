import { ONE_DAY_IN_SECONDS, YIELD_DAILY_DATA_LIMIT, ZERO_ETHEREUM_ADDRESS } from './constants';

describe('Constants', () => {
  it('The oneDayInSeconds constant should be 86400', () => {
    expect(ONE_DAY_IN_SECONDS).toBe(86400);
  });

  it('should return the correct zero address for ethereum', () => {
    expect(ZERO_ETHEREUM_ADDRESS).toBe('0x0000000000000000000000000000000000000000');
  });

  it('should return 100 as daily data limit for the yield calculation', () => {
    expect(YIELD_DAILY_DATA_LIMIT).toBe(90);
  });
});
