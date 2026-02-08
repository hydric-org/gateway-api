import { plainToInstance } from 'class-transformer';
import { TransformNumberArray, TransformQueryArray, TransformStringArray } from './query-array.transformer';

class TestNumberDto {
  @TransformNumberArray()
  values?: number[];
}

class TestStringDto {
  @TransformStringArray()
  values?: string[];
}

class TestGenericDto {
  @TransformQueryArray<number>((v) => Number(v) * 2)
  values?: number[];
}

describe('TransformQueryArray', () => {
  describe('TransformNumberArray', () => {
    it('should return undefined for undefined', () => {
      const result = plainToInstance(TestNumberDto, { values: undefined });
      expect(result.values).toBeUndefined();
    });

    it('should return undefined for null', () => {
      const result = plainToInstance(TestNumberDto, { values: null });
      expect(result.values).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = plainToInstance(TestNumberDto, { values: '' });
      expect(result.values).toBeUndefined();
    });

    it('should parse single string to number array', () => {
      const result = plainToInstance(TestNumberDto, { values: '1' });
      expect(result.values).toEqual([1]);
    });

    it('should parse comma-separated string to number array', () => {
      const result = plainToInstance(TestNumberDto, { values: '1,8453,10' });
      expect(result.values).toEqual([1, 8453, 10]);
    });

    it('should handle array of strings', () => {
      const result = plainToInstance(TestNumberDto, { values: ['1', '8453'] });
      expect(result.values).toEqual([1, 8453]);
    });

    it('should handle array of numbers', () => {
      const result = plainToInstance(TestNumberDto, { values: [1, 8453] });
      expect(result.values).toEqual([1, 8453]);
    });

    it('should handle single number value', () => {
      const result = plainToInstance(TestNumberDto, { values: 1 });
      expect(result.values).toEqual([1]);
    });

    it('should return undefined for empty array', () => {
      const result = plainToInstance(TestNumberDto, { values: [] });
      expect(result.values).toBeUndefined();
    });

    it('should filter out empty strings in comma-separated values', () => {
      const result = plainToInstance(TestNumberDto, { values: '1,,8453' });
      expect(result.values).toEqual([1, 8453]);
    });
  });

  describe('TransformStringArray', () => {
    it('should parse single string to string array', () => {
      const result = plainToInstance(TestStringDto, { values: 'usd-stablecoins' });
      expect(result.values).toEqual(['usd-stablecoins']);
    });

    it('should parse comma-separated string', () => {
      const result = plainToInstance(TestStringDto, { values: 'usd-stablecoins,eth-pegged-tokens' });
      expect(result.values).toEqual(['usd-stablecoins', 'eth-pegged-tokens']);
    });

    it('should handle array of strings', () => {
      const result = plainToInstance(TestStringDto, { values: ['usd-stablecoins', 'eth-pegged-tokens'] });
      expect(result.values).toEqual(['usd-stablecoins', 'eth-pegged-tokens']);
    });
  });

  describe('TransformQueryArray with custom parser', () => {
    it('should apply custom parser function', () => {
      const result = plainToInstance(TestGenericDto, { values: '5,10' });
      expect(result.values).toEqual([10, 20]);
    });
  });
});
