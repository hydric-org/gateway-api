import { BasketId, BasketIdUtils } from './basket-id.enum';

describe('BasketId Enum', () => {
  describe('BasketIdUtils', () => {
    describe('values', () => {
      it('should return all basket ids', () => {
        const values = BasketIdUtils.values();
        expect(values).toEqual(Object.values(BasketId));
        expect(values.length).toBeGreaterThan(0);
        expect(values).toContain(BasketId.USD_STABLECOINS);
      });
    });

    describe('includes', () => {
      it('should return true if the id is a valid BasketId', () => {
        expect(BasketIdUtils.includes(BasketId.USD_STABLECOINS)).toBe(true);
        expect(BasketIdUtils.includes('usd-stablecoins')).toBe(true);
      });

      it('should return false if the id is not a valid BasketId', () => {
        expect(BasketIdUtils.includes('invalid-id')).toBe(false);
        expect(BasketIdUtils.includes('')).toBe(false);
      });
    });
  });
});
