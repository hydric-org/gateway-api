import { BaseCursor } from '@core/base-cursor';

export class MultiChainTokenListCursor extends BaseCursor {
  bloomFilterBits!: string;
  offset!: number;
  hashFunctionsCount!: number;
  bitArraySize!: number;
}
