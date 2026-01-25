import { ISingleChainToken } from '../interfaces/token/single-chain-token.interface';
import { NetworkToken, NetworkTokenUtils } from './network-token';

export enum ChainId {
  ETHEREUM = 1,
  MONAD = 143,
  UNICHAIN = 130,
  HYPER_EVM = 999,
  BASE = 8453,
  PLASMA = 9745,
  SCROLL = 534352,
}

export abstract class ChainIdUtils {
  static values(): ChainId[] {
    return (Object.values(ChainId) as ChainId[]).filter((value) => typeof value === 'number');
  }

  static includes(chainId: number): boolean {
    return this.values().includes(chainId);
  }

  static nativeToken: Record<ChainId, ISingleChainToken> = {
    [ChainId.ETHEREUM]: { ...NetworkTokenUtils.metadata[NetworkToken.ETH], chainId: ChainId.ETHEREUM },
    [ChainId.SCROLL]: { ...NetworkTokenUtils.metadata[NetworkToken.ETH], chainId: ChainId.SCROLL },
    [ChainId.BASE]: { ...NetworkTokenUtils.metadata[NetworkToken.ETH], chainId: ChainId.BASE },
    [ChainId.UNICHAIN]: { ...NetworkTokenUtils.metadata[NetworkToken.ETH], chainId: ChainId.UNICHAIN },
    [ChainId.HYPER_EVM]: { ...NetworkTokenUtils.metadata[NetworkToken.HYPE], chainId: ChainId.HYPER_EVM },
    [ChainId.PLASMA]: { ...NetworkTokenUtils.metadata[NetworkToken.XPL], chainId: ChainId.PLASMA },
    [ChainId.MONAD]: { ...NetworkTokenUtils.metadata[NetworkToken.MON], chainId: ChainId.MONAD },
  };

  static chainName: Record<ChainId, string> = {
    [ChainId.ETHEREUM]: 'Ethereum',
    [ChainId.SCROLL]: 'Scroll',
    [ChainId.BASE]: 'Base',
    [ChainId.UNICHAIN]: 'Unichain',
    [ChainId.HYPER_EVM]: 'Hyper EVM',
    [ChainId.PLASMA]: 'Plasma',
    [ChainId.MONAD]: 'Monad',
  };
}
