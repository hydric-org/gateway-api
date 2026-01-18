import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { LiquidityPoolFilter } from '../liquidity-pool-filter.dto';
import { LiquidityPool, V3LiquidityPoolExample } from '../liquidity-pool.dto';

const FILTERS_EXAMPLE: LiquidityPoolFilter = {
  blockedPoolTypes: [],
  blockedProtocols: [],
  minimumTotalValueLockedUsd: 0,
};

export class SearchLiquidityPoolsResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'List of pools matching the search criteria.',
    isArray: true,
    type: () => LiquidityPool,
    example: [V3LiquidityPoolExample],
  })
  readonly pools!: LiquidityPool[];

  @ApiProperty({
    description: 'Filters that were applied to produce the result set.',
    type: Object,
    example: FILTERS_EXAMPLE,
  })
  readonly filters!: LiquidityPoolFilter;

  @ApiProperty({
    description: 'Cursor for the next page if exists',
    example: 'Y3Vyc29yXzE2NjMwMDAwMDA=',
  })
  readonly nextCursor!: string;

  constructor(params: { pools: LiquidityPool[]; filters: LiquidityPoolFilter; nextCursor: string }) {
    super({
      count: params.pools.length,
      objectType: LiquidityPool,
    });

    this.pools = params.pools;
    this.filters = params.filters;
    this.nextCursor = params.nextCursor;
  }
}
