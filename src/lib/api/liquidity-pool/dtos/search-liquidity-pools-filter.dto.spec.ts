import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchLiquidityPoolsFilter } from './search-liquidity-pools-filter.dto';

describe('SearchLiquidityPoolsFilter DTO', () => {
  it('should validate successfully with valid filters', async () => {
    const input = {
      minimumTotalValueLockedUsd: 100000,
      blockedPoolTypes: [LiquidityPoolType.V3],
      blockedProtocols: ['uniswap-v3'],
    };
    const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid pool types', async () => {
    const input = {
      blockedPoolTypes: ['INVALID_TYPE'],
    };
    const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('blockedPoolTypes');
  });

  it('should validate successfully with default values', async () => {
    const input = {};
    const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.minimumTotalValueLockedUsd).toBe(0);
    expect(dto.blockedPoolTypes).toEqual([]);
    expect(dto.blockedProtocols).toEqual([]);
    expect(dto.protocols).toEqual([]);
    expect(dto.poolTypes).toEqual([]);
  });

  describe('protocols filter', () => {
    it('should validate successfully with valid protocols', async () => {
      const input = {
        protocols: ['uniswap-v3', 'sushiswap-v3'],
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.protocols).toEqual(['uniswap-v3', 'sushiswap-v3']);
    });

    it('should transform a single protocol string to array', async () => {
      const input = {
        protocols: 'uniswap-v3',
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.protocols).toEqual(['uniswap-v3']);
    });

    it('should fail validation with non-string protocol values', async () => {
      const input = {
        protocols: [123],
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('protocols');
    });
  });

  describe('poolTypes filter', () => {
    it('should validate successfully with valid pool types', async () => {
      const input = {
        poolTypes: [LiquidityPoolType.V3, LiquidityPoolType.V4],
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.poolTypes).toEqual([LiquidityPoolType.V3, LiquidityPoolType.V4]);
    });

    it('should transform a single pool type to array', async () => {
      const input = {
        poolTypes: LiquidityPoolType.V3,
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.poolTypes).toEqual([LiquidityPoolType.V3]);
    });

    it('should fail validation with invalid pool type values', async () => {
      const input = {
        poolTypes: ['INVALID_TYPE'],
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('poolTypes');
    });
  });

  describe('combined filters', () => {
    it('should validate with both include and blocked filters', async () => {
      const input = {
        protocols: ['uniswap-v3'],
        blockedProtocols: ['sushiswap-v3'],
        poolTypes: [LiquidityPoolType.V3],
        blockedPoolTypes: [LiquidityPoolType.ALGEBRA],
      };
      const dto = plainToInstance(SearchLiquidityPoolsFilter, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
