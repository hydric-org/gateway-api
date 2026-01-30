import { ChainId } from '@core/enums/chain-id';

export interface ITokenFilter {
  chainIds?: ChainId[];
  minimumTotalValuePooledUsd: number;
  minimumPriceBackingUsd: number;
  minimumSwapsCount: number;
  minimumSwapVolumeUsd: number;
}
