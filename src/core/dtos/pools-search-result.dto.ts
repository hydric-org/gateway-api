import { LiquidityPool } from '../types';
import { PoolSearchFiltersDTO } from './pool-search-filters.dto';

export interface PoolsSearchResultDTO {
  readonly pools: LiquidityPool[];
  readonly filters: PoolSearchFiltersDTO;
}
