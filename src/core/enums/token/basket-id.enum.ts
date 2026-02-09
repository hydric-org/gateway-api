export enum BasketId {
  USD_STABLECOINS = 'usd-stablecoins',
  ETH_PEGGED_TOKENS = 'eth-pegged-tokens',
  BTC_PEGGED_TOKENS = 'btc-pegged-tokens',
  HYPE_PEGGED_TOKENS = 'hype-pegged-tokens',
  MONAD_PEGGED_TOKENS = 'monad-pegged-tokens',
  XAU_STABLECOINS = 'xau-stablecoins',
  EUR_STABLECOINS = 'eur-stablecoins',
}

export abstract class BasketIdUtils {
  static values(): BasketId[] {
    return Object.values(BasketId);
  }

  static includes(id: string): boolean {
    return (this.values() as string[]).includes(id);
  }
}
