import { PoolType } from '@core/enums/pool/pool-type';
import { IV4Pool } from '@core/interfaces/pool/v4-pool.interface';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { PoolHook, PoolHookExample } from './pool-hook-output';
import { Pool, PoolExample } from './pool-output.dto';

export const V4PoolExample = {
  ...PoolExample,
  stateViewAddress: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227',
  poolManagerAddress: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  tickSpacing: 60,
  latestTick: '-195948',
  latestSqrtPriceX96: '4407031279310232521923433',
  hook: PoolHookExample,
  permit2Address: '0x0000000000000000000000000000000000000000',
  poolType: PoolType.V4,
} satisfies V4Pool;

@ApiSchema({
  description: `
**V4 Pool Output Model**

Represents a concentrated liquidity pool following the Uniswap V4 architecture. 
This model extends the [Pool](${getSchemaPath(Pool)}) by providing 
specific state variables and additional metadata for V4 pools, such as hooks.
  `,
})
export class V4Pool extends Pool implements IV4Pool {
  @ApiProperty({
    description: `
The contract address used to read the current state of the pool. 

* **Note:** This may be 'null' for protocols that do not use a dedicated StateView contract (e.g., PancakeSwap Infinity).
`,
    nullable: true,
    examples: [V4PoolExample.stateViewAddress, null],
  })
  readonly stateViewAddress!: string | null;

  @ApiProperty({
    description:
      'The central singleton contract address that manages all V4 pool states and accounting for the protocol.',
    example: V4PoolExample.poolManagerAddress,
  })
  readonly poolManagerAddress!: string;

  @ApiProperty({
    description: 'The minimum price increment (tick) allowed for liquidity positions in this pool.',
    example: V4PoolExample.tickSpacing,
  })
  readonly tickSpacing!: number;

  @ApiProperty({
    description: 'The current active tick in logarithmic space, determining the current relative price of the pair.',
    example: V4PoolExample.latestTick,
  })
  readonly latestTick!: string;

  @ApiProperty({
    description: 'The Permit2 contract address used by the protocol to handle token approvals and transfers securely.',
    example: V4PoolExample.permit2Address,
  })
  readonly permit2Address!: string;

  @ApiProperty({
    description:
      'The current square root price encoded as a Q64.96 fixed-point number, consistent with concentrated liquidity math.',
    example: V4PoolExample.latestSqrtPriceX96,
  })
  readonly latestSqrtPriceX96!: string;

  @ApiProperty({
    description: `
The hook contract attached to this pool, which can modify or extend the pool's behavior by executing custom logic
at specific lifecycle points (e.g., swaps, liquidity changes).

If the pool does not use a hook, this field is 'null'.
`,
    type: PoolHook,
    nullable: true,
    example: V4PoolExample.hook,
  })
  readonly hook!: PoolHook | null;
}
