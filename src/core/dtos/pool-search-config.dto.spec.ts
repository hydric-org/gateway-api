import { validate } from 'class-validator';
import { PoolSearchConfigDTO } from './pool-search-config.dto';

describe('PoolSearchConfigDTO', () => {
  it('should assign the correct default values when no params are passed', () => {
    const actualConfig = new PoolSearchConfigDTO();
    const expectedConfig: PoolSearchConfigDTO = {
      testnetMode: false,
    };

    expect(actualConfig).toEqual(expectedConfig);
  });

  it('should throw an error if the testnetMode passed is not a boolean', async () => {
    const config = new PoolSearchConfigDTO();
    // @ts-expect-error testing invalid type
    config.testnetMode = 'xabas';

    const errors = await validate(config);
    expect(Object.values(errors[0].constraints!)).toContain('testnetMode must be a boolean');
  });
});
