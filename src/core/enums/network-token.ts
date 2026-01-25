import { ZERO_ETHEREUM_ADDRESS } from '../constants';
import { ISingleChainToken } from '../interfaces/token/single-chain-token.interface';

export enum NetworkToken {
  ETH,
  HYPE,
  XPL,
  MON,
}

export class NetworkTokenUtils {
  static readonly metadata: Record<NetworkToken, Omit<ISingleChainToken, 'chainId'>> = {
    [NetworkToken.ETH]: {
      address: ZERO_ETHEREUM_ADDRESS,
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },

    [NetworkToken.HYPE]: {
      address: ZERO_ETHEREUM_ADDRESS,
      decimals: 18,
      name: 'Hyperliquid',
      symbol: 'HYPE',
    },

    [NetworkToken.XPL]: {
      address: ZERO_ETHEREUM_ADDRESS,
      decimals: 18,
      name: 'Plasma',
      symbol: 'XPL',
    },

    [NetworkToken.MON]: {
      address: ZERO_ETHEREUM_ADDRESS,
      decimals: 18,
      name: 'Monad',
      symbol: 'MON',
    },
  };
}
