import { isEthereumAddress } from 'class-validator';

export const PoolAddress = {
  isValid,
};

function isValid(address: string): boolean {
  const v4PoolAddressRegex = /^0x[a-fA-F0-9]{64}$/;

  return isEthereumAddress(address) || v4PoolAddressRegex.test(address);
}
