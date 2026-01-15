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
}

export class ChainIdUtils {
  static values(): ChainId[] {
    return (Object.values(ChainId) as ChainId[]).filter((value) => typeof value === 'number');
  }

  static includes(chainId: number): boolean {
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
}
