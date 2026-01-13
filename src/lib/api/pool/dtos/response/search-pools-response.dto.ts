import { ApiProperty } from '@nestjs/swagger';
import { POOL_OUTPUT_SUBTYPES_EXAMPLES } from '../../pool_output_subtypes';
import { PoolFilter } from '../input/pool-filter-input.dto';
import { Pool } from '../output/pool-output.dto';

const FILTERS_EXAMPLE: PoolFilter = {
  blockedPoolTypes: [],
  blockedProtocols: [],
  minimumTvlUsd: 0,
};

export class PoolSearchResponse {
  @ApiProperty({
    description:
      'List of pools matching the search criteria. Each entry always contains the common PoolDTO fields; additional fields vary depending on `poolType` (e.g., V3, V4, ALGEBRA) and are shown in the examples below.',
    isArray: true,
    type: () => Pool,
    example: POOL_OUTPUT_SUBTYPES_EXAMPLES,
  })
  readonly pools: Pool[] = [];

  @ApiProperty({
    description: 'Filters that were applied to produce the result set.',
    type: Object,
    example: FILTERS_EXAMPLE,
  })
  readonly filters: PoolFilter = {
    blockedPoolTypes: [],
    blockedProtocols: [],
    minimumTvlUsd: 0,
  };

  @ApiProperty({
    description:
      'Base64url-encoded cursor that can be passed to the `cursor` field of subsequent requests to fetch the next page.',
    example: 'Y3Vyc29yXzE2NjMwMDAwMDA=',
  })
  readonly nextCursor: string = '';
}
