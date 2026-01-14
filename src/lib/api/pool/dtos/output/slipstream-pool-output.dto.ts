import { PoolType } from '@core/enums/pool/pool-type';
import { ISlipstreamPool } from '@core/interfaces/pool/slipstream-pool.interface';
import { ApiSchema } from '@nestjs/swagger';
import { V3Pool, V3PoolExample } from './v3-pool-output.dto';

export const SlipstreamPoolExample = {
  ...V3PoolExample,
  poolType: PoolType.SLIPSTREAM,
} satisfies ISlipstreamPool;

@ApiSchema({
  description: `
**Slipstream Pool Output Model**

Represents a concentrated liquidity pool following the Slipstream architecture. 
This model extends the **Base Pool Model** by providing 
specific state variables and additional metadata for Slipstream pools.
`,
})
export class SlipstreamPool extends V3Pool implements ISlipstreamPool {}
