import { ChainId } from '@core/enums/chain-id';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { GetMultipleChainsTokenBasketsQueryParams } from './get-token-baskets-query-params.dto';

describe('GetMultipleChainsTokenBasketsQueryParams', () => {
  describe('chainIds transformation', () => {
    it('should handle single value as string', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: '1',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM]);
    });

    it('should handle comma-separated string', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: '1,8453',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
    });

    it('should handle array format (simulating chainIds[]=value)', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: ['1'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM]);
    });

    it('should handle multiple array values (simulating chainIds[]=1&chainIds[]=8453)', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: ['1', '8453'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
    });

    it('should handle numeric array values', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: [1, 8453],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
    });

    it('should return undefined for undefined chainIds', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toBeUndefined();
    });

    it('should return undefined for empty string', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toBeUndefined();
    });

    it('should fail validation for unsupported chain ID', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: '999999',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('chainIds');
    });

    it('should fail validation for non-numeric string', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: 'abc',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('chainIds');
    });

    it('should filter out empty values in comma-separated list', async () => {
      const dto = plainToClass(GetMultipleChainsTokenBasketsQueryParams, {
        chainIds: '1,,8453',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
    });
  });
});
