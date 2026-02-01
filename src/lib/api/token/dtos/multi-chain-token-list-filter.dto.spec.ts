import { ChainId } from '@core/enums/chain-id';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MultiChainTokenListFilter } from './multi-chain-token-list-filter.dto';

describe('MultiChainTokenListFilter', () => {
  it('should have high default values for list endpoints', () => {
    const filter = new MultiChainTokenListFilter();
    expect(filter.minimumTotalValuePooledUsd).toBe(10000);
    expect(filter.minimumSwapsCount).toBe(1000);
    expect(filter.minimumSwapVolumeUsd).toBe(100000);
  });

  it('should validate chainIds', async () => {
    const plain = {
      chainIds: [ChainId.ETHEREUM, ChainId.BASE],
    };
    const filter = plainToInstance(MultiChainTokenListFilter, plain);
    const errors = await validate(filter);
    expect(errors.length).toBe(0);
    expect(filter.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
  });
});
