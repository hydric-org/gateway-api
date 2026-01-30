/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SingleChainTokenSearchFilter } from './single-chain-token-search-filter.dto';

describe('SingleChainTokenSearchFilter', () => {
  it('should have zero default values for search visibility', () => {
    const filter = new SingleChainTokenSearchFilter();
    expect(filter.minimumTotalValuePooledUsd).toBe(0);
    expect(filter.minimumPriceBackingUsd).toBe(0);
    expect(filter.minimumSwapsCount).toBe(0);
    expect(filter.minimumSwapVolumeUsd).toBe(0);
  });

  it('should not have symbols or chainIds properties', () => {
    const filter = new SingleChainTokenSearchFilter() as any;
    expect(filter.symbols).toBeUndefined();
    expect(filter.chainIds).toBeUndefined();
  });
});
