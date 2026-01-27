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
