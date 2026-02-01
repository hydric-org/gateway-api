import { ChainId } from '@core/enums/chain-id';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MultiChainTokenSearchFilter } from './multi-chain-token-search-filter.dto';

describe('MultiChainTokenSearchFilter', () => {
  it('should have zero default values for search visibility', () => {
    const filter = new MultiChainTokenSearchFilter();
    expect(filter.minimumTotalValuePooledUsd).toBe(0);
    expect(filter.minimumSwapsCount).toBe(0);
    expect(filter.minimumSwapVolumeUsd).toBe(0);
  });

  it('should support chainIds but not symbols', async () => {
    const plain = { chainIds: [ChainId.ETHEREUM] };
    const filter = plainToInstance(MultiChainTokenSearchFilter, plain);
    const errors = await validate(filter);
    expect(errors.length).toBe(0);
    expect((filter as any).symbols).toBeUndefined();
  });
});
