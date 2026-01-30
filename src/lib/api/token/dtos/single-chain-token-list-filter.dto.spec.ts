import { SingleChainTokenListFilter } from './single-chain-token-list-filter.dto';

describe('SingleChainTokenListFilter', () => {
  it('should have high default values for list endpoints', () => {
    const filter = new SingleChainTokenListFilter();
    expect(filter.minimumTotalValuePooledUsd).toBe(10000);
    expect(filter.minimumPriceBackingUsd).toBe(100000);
    expect(filter.minimumSwapsCount).toBe(1000);
    expect(filter.minimumSwapVolumeUsd).toBe(100000);
  });
});
