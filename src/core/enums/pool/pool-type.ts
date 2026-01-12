export enum PoolType {
  V3 = 'V3',
  V4 = 'V4',
  ALGEBRA = 'ALGEBRA',
  SLIPSTREAM = 'SLIPSTREAM',
}

export class PoolTypeUtils {
  static values(): string[] {
    return Object.values(PoolType) as string[];
  }

  static isValid(value: string): value is PoolType {
    return (Object.values(PoolType) as string[]).includes(value);
  }
}
