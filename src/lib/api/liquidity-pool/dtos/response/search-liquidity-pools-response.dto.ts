import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LiquidityPool, V3LiquidityPoolExample } from '../liquidity-pool.dto';
import { SearchLiquidityPoolsFilter } from '../search-liquidity-pools-filter.dto';

const FILTERS_EXAMPLE: SearchLiquidityPoolsFilter = {
  blockedPoolTypes: [LiquidityPoolType.V3],
  blockedProtocols: ['uniswap-v3'],
  minimumTotalValueLockedUsd: 10000,
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
  readonly filters!: SearchLiquidityPoolsFilter;

  @ApiPropertyOptional({
    description: 'Cursor for the next page. Null if no more results.',
    example: 'Y3Vyc29yXzE2NjMwMDAwMDA=',
    nullable: true,
  })
  readonly nextCursor!: string | null;

  constructor(params: { pools: LiquidityPool[]; filters: SearchLiquidityPoolsFilter; nextCursor: string | null }) {
    super({
      count: params.pools.length,
      objectType: LiquidityPool,
    });

    this.pools = params.pools;
    this.filters = params.filters;
    this.nextCursor = params.nextCursor;
  }
}
