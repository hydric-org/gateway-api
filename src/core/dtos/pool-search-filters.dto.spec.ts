import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';
import { PoolType } from '../enums/pool-type';
import { PoolSearchFiltersDTO } from './pool-search-filters.dto';

describe('PoolSearchFiltersDTO', () => {
  it('should assign the correct default values when no params are passed', () => {
    const actualFilters = new PoolSearchFiltersDTO();

    const expectedFilters: PoolSearchFiltersDTO = {
      blockedPoolTypes: [],
      blockedProtocols: [],
      minimumTvlUsd: 0,
    };

    expect(actualFilters).toEqual(expectedFilters);
  });

  it('should throw if passing minimumTvlUsd as infinity', async () => {
    const filters = new PoolSearchFiltersDTO();

    filters.minimumTvlUsd = Infinity;
    const errors = await validate(filters);

    expect(errors[0].constraints!['isNumber']).toBe('minimumTvlUsd must be a positive number');
  });

  it('should throw if passing minimumTvlUsd as NaN', async () => {
    const filters = new PoolSearchFiltersDTO();

    filters.minimumTvlUsd = NaN;
    const errors = await validate(filters);

    expect(errors[0].constraints!['isNumber']).toBe('minimumTvlUsd must be a positive number');
  });

  it('should throw if passing minimumTvlUsd as a random non number string', async () => {
    const filters = new PoolSearchFiltersDTO();

    // @ts-expect-error expecting a random string
    filters.minimumTvlUsd = 'not a number';
    const errors = await validate(filters);

    expect(errors[0].constraints!['isNumber']).toBe('minimumTvlUsd must be a positive number');
  });

  it('should throw if passing minimumTvlUsd as a bool', async () => {
    const filters = new PoolSearchFiltersDTO();

    // @ts-expect-error expecting error
    filters.minimumTvlUsd = true;
    const errors = await validate(filters);

    expect(errors[0].constraints!['isNumber']).toBe('minimumTvlUsd must be a positive number');
  });

  it('should throw is passing a negative value for minimumTvlUsd', async () => {
    const filters = new PoolSearchFiltersDTO();

    filters.minimumTvlUsd = -10;
    const errors = await validate(filters);

    expect(errors[0].constraints!['min']).toBe('minimumTvlUsd must not be less than 0');
  });

  it('should not throw if passing minimumTvlUsd as a Number String', async () => {
    const plainFilters = { minimumTvlUsd: '21' };
    const filters = plainToInstance(PoolSearchFiltersDTO, plainFilters);

    const errors = await validate(filters);

    expect(errors.length).toBe(0);
    expect(filters.minimumTvlUsd).toBe(21);
  });

  it('should throw if passing blockedPoolTypes with a pool type not in the enum', async () => {
    const filters = new PoolSearchFiltersDTO();

    // @ts-expect-error expecting error
    filters.blockedPoolTypes = ['not a pool type'];
    const errors = await validate(filters);

    expect(errors[0].constraints!['isEnum']).toBe('Each blockedPoolType must be a valid PoolType: V3, V4');
  });

  it('should not throw if passing blockedPoolTypes with a pool type in the enum', async () => {
    const filters = new PoolSearchFiltersDTO();

    filters.blockedPoolTypes = [PoolType.V3];
    const errors = await validate(filters);

    expect(errors.length).toBe(0);
  });

  it('should throw if passing blockedProtocols with a non string value', async () => {
    const filters = new PoolSearchFiltersDTO();

    // @ts-expect-error expecting error
    filters.blockedProtocols = [true, 'protocol-id'];
    const errors = await validate(filters);

    expect(errors[0].constraints!['isString']).toBe('Each blockedProtocol should be a protocol id as string');
  });
});
