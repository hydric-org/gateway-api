import { PoolType } from '@core/enums/pool/pool-type';
import { ISlipstreamPool } from '@core/interfaces/pool/slipstream-pool.interface';
import { ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { PoolOutputDTO } from './pool-output.dto';
import { V3PoolOutputDTO, V3PoolOutputDTOExample } from './v3-pool-output.dto';

export const SlipstreamPoolOutputDTOExample = {
  ...V3PoolOutputDTOExample,
  poolType: PoolType.SLIPSTREAM,
} satisfies ISlipstreamPool;

@ApiSchema({
  description: `
**Slipstream Pool Output Model**

Represents a concentrated liquidity pool following the Slipstream architecture. 
This model extends the [PoolOutputDTO](${getSchemaPath(PoolOutputDTO)}) by providing 
specific state variables and additional metadata for Slipstream pools.
`,
})
export class SlipstreamPoolOutputDTO extends V3PoolOutputDTO implements ISlipstreamPool {}
