import { ChainId, ChainIdUtils } from './chain-id';
import { NativeToken } from './native-token';

describe('ChainIdUtils', () => {
  describe('values', () => {
    it('should return all numeric chain IDs', () => {
      const values = ChainIdUtils.values();
      expect(values).toContain(ChainId.ETHEREUM);
      expect(values).toContain(ChainId.MONAD);
      expect(values).toContain(ChainId.UNICHAIN);
      expect(values).toContain(ChainId.HYPER_EVM);
      expect(values).toContain(ChainId.BASE);
      expect(values).toContain(ChainId.PLASMA);
      expect(values).toContain(ChainId.SCROLL);
      expect(values.every((v) => typeof v === 'number')).toBe(true);
    });
  });

  describe('includes', () => {
    it('should return true for valid chain IDs', () => {
      expect(ChainIdUtils.includes(ChainId.ETHEREUM)).toBe(true);
      expect(ChainIdUtils.includes(ChainId.BASE)).toBe(true);
    });

    it('should return false for invalid chain IDs', () => {
      expect(ChainIdUtils.includes(999999)).toBe(false);
      expect(ChainIdUtils.includes(0)).toBe(false);
    });
  });

  describe('chainName', () => {
    it('should have a name for every chain ID', () => {
      ChainIdUtils.values().forEach((chainId) => {
        expect(ChainIdUtils.chainName[chainId]).toBeDefined();
      });
    });

    it('should return correct names for specific chains', () => {
      expect(ChainIdUtils.chainName[ChainId.ETHEREUM]).toBe('Ethereum');
      expect(ChainIdUtils.chainName[ChainId.BASE]).toBe('Base');
    });
  });

  describe('wrappedNativeAddress', () => {
    it('should have a wrapped native address for every chain ID', () => {
      ChainIdUtils.values().forEach((chainId) => {
        expect(ChainIdUtils.wrappedNativeAddress[chainId]).toBeDefined();
        expect(ChainIdUtils.wrappedNativeAddress[chainId]).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });
    });
  });

  describe('nativeTokenParams', () => {
    it('should have native token params for every chain ID', () => {
      ChainIdUtils.values().forEach((chainId) => {
        const params = ChainIdUtils.nativeTokenParams[chainId];
        expect(params).toBeDefined();
        expect(params.symbol).toBeDefined();
        expect(params.name).toBeDefined();
        expect(params.decimals).toBe(18);
      });
    });

    it('should return correct metadata for specific chains', () => {
      expect(ChainIdUtils.nativeTokenParams[ChainId.ETHEREUM].symbol).toBe(NativeToken.ETH);
      expect(ChainIdUtils.nativeTokenParams[ChainId.HYPER_EVM].symbol).toBe(NativeToken.HYPE);
      expect(ChainIdUtils.nativeTokenParams[ChainId.MONAD].symbol).toBe(NativeToken.MON);
      expect(ChainIdUtils.nativeTokenParams[ChainId.PLASMA].symbol).toBe(NativeToken.XPL);
    });
  });
});
