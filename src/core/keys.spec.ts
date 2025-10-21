import { Networks } from './enums/networks';
import { singleChainTokenCacheKey } from './keys';

describe('Keys', () => {
  it('should return the correct token cache key', () => {
    const tokenAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const chainId = Networks.BASE;

    expect(singleChainTokenCacheKey(tokenAddress, chainId)).toBe(`single-chain-token-cache-${chainId}-${tokenAddress}`);
  });
});
