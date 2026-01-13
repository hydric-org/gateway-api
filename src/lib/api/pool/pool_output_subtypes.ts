import { AlgebraPool, AlgebraPoolExample } from './dtos/output/algebra-pool-output.dto';
import { SlipstreamPool, SlipstreamPoolExample } from './dtos/output/slipstream-pool-output.dto';
import { V3Pool, V3PoolExample } from './dtos/output/v3-pool-output.dto';
import { V4Pool, V4PoolExample } from './dtos/output/v4-pool-output.dto';

export const POOL_OUTPUT_SUBTYPE_ENTRIES = [
  { model: V4Pool, example: V4PoolExample },
  { model: V3Pool, example: V3PoolExample },
  { model: AlgebraPool, example: AlgebraPoolExample },
  { model: SlipstreamPool, example: SlipstreamPoolExample },
];

export const POOL_OUTPUT_SUBTYPES: Array<typeof V4Pool | typeof V3Pool | typeof AlgebraPool | typeof SlipstreamPool> =
  POOL_OUTPUT_SUBTYPE_ENTRIES.map((e) => e.model);

export const POOL_OUTPUT_SUBTYPES_EXAMPLES: PoolOutputSubtypesExample[] = POOL_OUTPUT_SUBTYPE_ENTRIES.map(
  (e) => e.example,
);

export type POOL_OUTPUT_SUBTYPE_ENTRIES_T = typeof POOL_OUTPUT_SUBTYPE_ENTRIES;
export type PoolOutputSubtypesExample = POOL_OUTPUT_SUBTYPE_ENTRIES_T[number]['example'];
