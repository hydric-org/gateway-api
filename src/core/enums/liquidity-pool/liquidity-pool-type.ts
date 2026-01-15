export enum LiquidityPoolType {
  V3 = 'V3',
  V4 = 'V4',
  ALGEBRA = 'ALGEBRA',
  SLIPSTREAM = 'SLIPSTREAM',
}

export class LiquidityPoolTypeUtils {
  static values(): string[] {
    return Object.values(LiquidityPoolType) as string[];
  }
}
