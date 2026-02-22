import { NativeToken, NativeTokenMetadata, NativeTokenUtils } from './native-token';

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

  static wrappedNativeAddress: Record<ChainId, string> = {
    [ChainId.ETHEREUM]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [ChainId.SCROLL]: '0x5300000000000000000000000000000000000004',
    [ChainId.BASE]: '0x4200000000000000000000000000000000000006',
    [ChainId.UNICHAIN]: '0x4200000000000000000000000000000000000006',
    [ChainId.HYPER_EVM]: '0x5555555555555555555555555555555555555555',
    [ChainId.MONAD]: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
    [ChainId.PLASMA]: '0x6100E367285b01F48D07953803A2d8dCA5D19873',
  };

  static nativeTokenParams: Record<ChainId, NativeTokenMetadata> = {
    [ChainId.ETHEREUM]: NativeTokenUtils.getMetadata(NativeToken.ETH),
    [ChainId.SCROLL]: NativeTokenUtils.getMetadata(NativeToken.ETH),
    [ChainId.BASE]: NativeTokenUtils.getMetadata(NativeToken.ETH),
    [ChainId.UNICHAIN]: NativeTokenUtils.getMetadata(NativeToken.ETH),
    [ChainId.HYPER_EVM]: NativeTokenUtils.getMetadata(NativeToken.HYPE),
    [ChainId.MONAD]: NativeTokenUtils.getMetadata(NativeToken.MON),
    [ChainId.PLASMA]: NativeTokenUtils.getMetadata(NativeToken.XPL),
  };
}
