import { Networks } from './enums/networks';

export function singleChainTokenCacheKey(tokenAddress: string, chainId: Networks): string {
  return `single-chain-token-cache-${chainId}-${tokenAddress}`;
}
