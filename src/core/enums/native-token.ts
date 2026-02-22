export enum NativeToken {
  ETH = 'ETH',
  HYPE = 'HYPE',
  MON = 'MON',
  XPL = 'XPL',
}

export interface NativeTokenMetadata {
  symbol: NativeToken;
  name: string;
  decimals: number;
  logoUrl: string;
}

export abstract class NativeTokenUtils {
  static readonly metadata: Record<NativeToken, NativeTokenMetadata> = {
    [NativeToken.ETH]: {
      symbol: NativeToken.ETH,
      name: 'Ether',
      decimals: 18,
      logoUrl: 'https://logos.hydric.org/tokens/1/0x0000000000000000000000000000000000000000',
    },
    [NativeToken.HYPE]: {
      symbol: NativeToken.HYPE,
      name: 'Hyperliquid',
      decimals: 18,
      logoUrl: 'https://logos.hydric.org/tokens/999/0x0000000000000000000000000000000000000000',
    },
    [NativeToken.MON]: {
      symbol: NativeToken.MON,
      name: 'Monad',
      decimals: 18,
      logoUrl: 'https://logos.hydric.org/tokens/143/0x0000000000000000000000000000000000000000',
    },
    [NativeToken.XPL]: {
      symbol: NativeToken.XPL,
      name: 'Plasma',
      decimals: 18,
      logoUrl: 'https://logos.hydric.org/tokens/9745/0x0000000000000000000000000000000000000000',
    },
  };

  static getMetadata(token: NativeToken): NativeTokenMetadata {
    return this.metadata[token];
  }
}
