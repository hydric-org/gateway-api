import { ISingleChainToken } from '../interfaces/token/single-chain-token.interface.js';
import { NetworkToken, NetworkTokenUtils } from './network-token.js';

export enum Network {
  ETHEREUM = 1,
  SCROLL = 534352,
  SEPOLIA = 11155111,
  BASE = 8453,
  UNICHAIN = 130,
  HYPER_EVM = 999,
  PLASMA = 9745,
  MONAD = 143,
  // BNB = 56,
}

export class NetworkUtils {
  static values(): Network[] {
    return (Object.values(Network) as Network[]).filter((value) => typeof value === 'number');
  }

  static isTestnet(network: Network): boolean {
    switch (network) {
      case Network.SEPOLIA:
        return true;
      default:
        return false;
    }
  }

  static isValidChainId(chainId: number): boolean {
    return this.values().includes(chainId);
  }

  static nativeToken: Record<Network, ISingleChainToken> = {
    [Network.ETHEREUM]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [Network.SCROLL]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [Network.SEPOLIA]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [Network.BASE]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [Network.UNICHAIN]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [Network.HYPER_EVM]: NetworkTokenUtils.metadata[NetworkToken.HYPE],
    [Network.PLASMA]: NetworkTokenUtils.metadata[NetworkToken.XPL],
    [Network.MONAD]: NetworkTokenUtils.metadata[NetworkToken.MON],
  };

  static wrappedNativeAddress(network: Network): string {
    switch (network) {
      case Network.ETHEREUM:
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      case Network.SCROLL:
        return '0x5300000000000000000000000000000000000004';
      case Network.SEPOLIA:
        return '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
      case Network.BASE:
        return '0x4200000000000000000000000000000000000006';
      case Network.UNICHAIN:
        return '0x4200000000000000000000000000000000000006';
      case Network.HYPER_EVM:
        return '0x5555555555555555555555555555555555555555';
      case Network.PLASMA:
        return '0x6100e367285b01f48d07953803a2d8dca5d19873';
      case Network.MONAD:
        return '0x3bd359c1119da7da1d913d1c4d2b7c461115433a';
    }
  }
}
