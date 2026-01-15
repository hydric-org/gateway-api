import { ISingleChainToken } from '../interfaces/token/single-chain-token.interface.js';
import { NetworkToken, NetworkTokenUtils } from './network-token.js';

export enum ChainId {
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
  static values(): ChainId[] {
    return (Object.values(ChainId) as ChainId[]).filter((value) => typeof value === 'number');
  }

  static isTestnet(network: ChainId): boolean {
    switch (network) {
      case ChainId.SEPOLIA:
        return true;
      default:
        return false;
    }
  }

  static isValidChainId(chainId: number): boolean {
    return this.values().includes(chainId);
  }

  static nativeToken: Record<ChainId, ISingleChainToken> = {
    [ChainId.ETHEREUM]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [ChainId.SCROLL]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [ChainId.SEPOLIA]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [ChainId.BASE]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [ChainId.UNICHAIN]: NetworkTokenUtils.metadata[NetworkToken.ETH],
    [ChainId.HYPER_EVM]: NetworkTokenUtils.metadata[NetworkToken.HYPE],
    [ChainId.PLASMA]: NetworkTokenUtils.metadata[NetworkToken.XPL],
    [ChainId.MONAD]: NetworkTokenUtils.metadata[NetworkToken.MON],
  };

  static wrappedNativeAddress(network: ChainId): string {
    switch (network) {
      case ChainId.ETHEREUM:
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      case ChainId.SCROLL:
        return '0x5300000000000000000000000000000000000004';
      case ChainId.SEPOLIA:
        return '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
      case ChainId.BASE:
        return '0x4200000000000000000000000000000000000006';
      case ChainId.UNICHAIN:
        return '0x4200000000000000000000000000000000000006';
      case ChainId.HYPER_EVM:
        return '0x5555555555555555555555555555555555555555';
      case ChainId.PLASMA:
        return '0x6100e367285b01f48d07953803a2d8dca5d19873';
      case ChainId.MONAD:
        return '0x3bd359c1119da7da1d913d1c4d2b7c461115433a';
    }
  }
}
