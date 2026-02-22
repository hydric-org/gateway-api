import { NativeToken, NativeTokenUtils } from './native-token';

describe('NativeTokenUtils', () => {
  describe('getMetadata', () => {
    it('should return correct metadata for ETH', () => {
      const metadata = NativeTokenUtils.getMetadata(NativeToken.ETH);
      expect(metadata).toEqual({
        symbol: NativeToken.ETH,
        name: 'Ether',
        decimals: 18,
        logoUrl: 'https://logos.hydric.org/tokens/1/0x0000000000000000000000000000000000000000',
      });
    });

    it('should return correct metadata for HYPE', () => {
      const metadata = NativeTokenUtils.getMetadata(NativeToken.HYPE);
      expect(metadata).toEqual({
        symbol: NativeToken.HYPE,
        name: 'Hyperliquid',
        decimals: 18,
        logoUrl: 'https://logos.hydric.org/tokens/999/0x0000000000000000000000000000000000000000',
      });
    });

    it('should return correct metadata for MON', () => {
      const metadata = NativeTokenUtils.getMetadata(NativeToken.MON);
      expect(metadata).toEqual({
        symbol: NativeToken.MON,
        name: 'Monad',
        decimals: 18,
        logoUrl: 'https://logos.hydric.org/tokens/143/0x0000000000000000000000000000000000000000',
      });
    });

    it('should return correct metadata for XPL', () => {
      const metadata = NativeTokenUtils.getMetadata(NativeToken.XPL);
      expect(metadata).toEqual({
        symbol: NativeToken.XPL,
        name: 'Plasma',
        decimals: 18,
        logoUrl: 'https://logos.hydric.org/tokens/9745/0x0000000000000000000000000000000000000000',
      });
    });
  });

  describe('metadata', () => {
    it('should contain all native tokens', () => {
      const tokens = Object.values(NativeToken);
      tokens.forEach((token) => {
        expect(NativeTokenUtils.metadata[token]).toBeDefined();
      });
    });
  });
});
