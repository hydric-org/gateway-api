import { AlgebraPoolOutputDTO, AlgebraPoolOutputDTOExample } from './dtos/output/algebra-pool-output.dto';
import { SlipstreamPoolOutputDTO, SlipstreamPoolOutputDTOExample } from './dtos/output/slipstream-pool-output.dto';
import { V3PoolOutputDTO, V3PoolOutputDTOExample } from './dtos/output/v3-pool-output.dto';
import { V4PoolOutputDTO, V4PoolOutputDTOExample } from './dtos/output/v4-pool-output.dto';

export const POOL_OUTPUT_SUBTYPE_ENTRIES = [
  { model: V4PoolOutputDTO, example: V4PoolOutputDTOExample },
  { model: V3PoolOutputDTO, example: V3PoolOutputDTOExample },
  { model: AlgebraPoolOutputDTO, example: AlgebraPoolOutputDTOExample },
  { model: SlipstreamPoolOutputDTO, example: SlipstreamPoolOutputDTOExample },
];

export const POOL_OUTPUT_SUBTYPES: Array<
  typeof V4PoolOutputDTO | typeof V3PoolOutputDTO | typeof AlgebraPoolOutputDTO | typeof SlipstreamPoolOutputDTO
> = POOL_OUTPUT_SUBTYPE_ENTRIES.map((e) => e.model);

export const POOL_OUTPUT_SUBTYPES_EXAMPLES: PoolOutputSubtypesExample[] = POOL_OUTPUT_SUBTYPE_ENTRIES.map(
  (e) => e.example,
);

export type POOL_OUTPUT_SUBTYPE_ENTRIES_T = typeof POOL_OUTPUT_SUBTYPE_ENTRIES;
export type PoolOutputSubtypesExample = POOL_OUTPUT_SUBTYPE_ENTRIES_T[number]['example'];
