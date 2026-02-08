import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { GetTokenBasketsListQueryParams } from './get-token-baskets-list-query-params.dto';

describe('GetTokenBasketsListQueryParams', () => {
  describe('chainIds transformation', () => {
    it('should handle single value as string', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        chainIds: '1',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM]);
    });

    it('should handle comma-separated string', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        chainIds: '1,8453',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
    });

    it('should handle array format (simulating chainIds[]=value)', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        chainIds: ['1', '8453'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
    });

    it('should fail validation for unsupported chain ID', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        chainIds: '999999',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('chainIds');
    });
  });

  describe('basketIds transformation', () => {
    it('should handle single value as string', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        basketIds: BasketId.USD_STABLECOINS,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.basketIds).toEqual([BasketId.USD_STABLECOINS]);
    });

    it('should handle comma-separated string', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        basketIds: `${BasketId.USD_STABLECOINS},${BasketId.ETH_PEGGED_TOKENS}`,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.basketIds).toEqual([BasketId.USD_STABLECOINS, BasketId.ETH_PEGGED_TOKENS]);
    });

    it('should handle array format (simulating basketIds[]=value)', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        basketIds: [BasketId.USD_STABLECOINS],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.basketIds).toEqual([BasketId.USD_STABLECOINS]);
    });

    it('should handle multiple array values (simulating basketIds[]=a&basketIds[]=b)', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        basketIds: [BasketId.USD_STABLECOINS, BasketId.ETH_PEGGED_TOKENS],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.basketIds).toEqual([BasketId.USD_STABLECOINS, BasketId.ETH_PEGGED_TOKENS]);
    });

    it('should return undefined for undefined basketIds', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.basketIds).toBeUndefined();
    });

    it('should return undefined for empty string', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        basketIds: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.basketIds).toBeUndefined();
    });

    it('should fail validation for unsupported basket ID', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        basketIds: 'invalid-basket-id',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('basketIds');
    });
  });

  describe('combined chainIds and basketIds', () => {
    it('should handle both chainIds and basketIds together', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        chainIds: ['1', '8453'],
        basketIds: [BasketId.USD_STABLECOINS, BasketId.ETH_PEGGED_TOKENS],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
      expect(dto.basketIds).toEqual([BasketId.USD_STABLECOINS, BasketId.ETH_PEGGED_TOKENS]);
    });

    it('should handle mixed formats for chainIds and basketIds', async () => {
      const dto = plainToClass(GetTokenBasketsListQueryParams, {
        chainIds: '1,8453',
        basketIds: [BasketId.USD_STABLECOINS],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chainIds).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
      expect(dto.basketIds).toEqual([BasketId.USD_STABLECOINS]);
    });
  });
});
