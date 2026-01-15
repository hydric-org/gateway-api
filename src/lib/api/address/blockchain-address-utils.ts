import { ChainIdUtils } from '@core/enums/chain-id';
import { isEthereumAddress } from 'class-validator';

export const BlockchainAddressUtils = {
  isValidBlockchainAddress,
  getBlockchainAddressValidationError,
};

function isValidBlockchainAddress(value: any): boolean {
  return getBlockchainAddressValidationError(value) === null;
}

export function getBlockchainAddressValidationError(value: any): string | null {
  if (!value || typeof value !== 'object') return `Value is not an object containing a chainId and an address.`;

  const { chainId, address } = value;

  if (!ChainIdUtils.includes(chainId)) {
    return `Invalid chainId: ${chainId}. Supported: [${ChainIdUtils.values().join(', ')}]`;
  }

  if (!address) {
    return 'Address is missing';
  }

  if (!isEthereumAddress(address)) {
    return `Invalid ethereum address format: ${address}`;
  }

  return null;
}
