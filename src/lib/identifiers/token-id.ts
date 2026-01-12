import { NetworkUtils } from '@core/enums/network';

import { isEthereumAddress } from 'class-validator';

export const TokenId = {
  isValid,
};

function isValid(value: any): boolean {
  if (typeof value !== 'string') return false;
  const parts = value.split('-');

  if (parts.length !== 2) return false;
  const [chainStr, address] = parts;

  const chainId = Number(chainStr);
  if (!Number.isFinite(chainId)) return false;

  if (!NetworkUtils.isValidChainId(chainId)) return false;
  if (!isEthereumAddress(address)) return false;

  return true;
}
