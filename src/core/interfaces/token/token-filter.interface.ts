export interface ITokenFilter {
  symbols?: string[];
  minimumTotalValuePooledUsd: number;
  minimumPriceBackingUsd: number;
  minimumSwapsCount: number;
  minimumPriceBackingToTvlRatio: number;
}
