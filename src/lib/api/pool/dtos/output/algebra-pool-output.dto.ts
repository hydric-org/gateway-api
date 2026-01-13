import { PoolType } from '@core/enums/pool/pool-type';
import { IAlgebraPool } from '@core/interfaces/pool/algebra-pool.interface';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { AlgebraPoolPlugin, AlgebraPoolPluginExample } from './algebra-pool-plugin-output.dto';
import { Pool } from './pool-output.dto';
import { V3Pool, V3PoolExample } from './v3-pool-output.dto';

export const AlgebraPoolExample = {
  ...V3PoolExample,
  deployer: '0x4440854B2d02C57A0Dc5c58b7A884562D875c0c4',
  version: '1.2.2',
  communityFee: 100,
  plugin: AlgebraPoolPluginExample,
  poolType: PoolType.ALGEBRA,
} satisfies IAlgebraPool;

@ApiSchema({
  description: `
**Algebra Pool Output Model**

Represents a concentrated liquidity pool following the Algebra architecture. 
This model extends the [Pool](${getSchemaPath(Pool)}) by providing 
specific state variables and additional metadata for Algebra pools, such as plugin data,
version, etc...
  `,
})
export class AlgebraPool extends V3Pool implements IAlgebraPool {
  @ApiProperty({
    description: `
The address that initiated the pool deployment. 

* **Standard Pools:** Returns the Zero Address (0x0...) for pools deployed via the default factory.
* **Custom/Permissioned Pools:** Returns the specific address of the deployer for non-standard or private pool instances.
`,
    example: AlgebraPoolExample.deployer,
  })
  readonly deployer!: string;

  @ApiProperty({
    description: 'The specific version of the Algebra core/integral logic used by this pool instance.',
    example: AlgebraPoolExample.version,
  })
  readonly version!: string;

  @ApiProperty({
    description:
      'The protocol-level "cut" taken from the total swap fee, expressed in per-mille (1/1000). For example, a value of 100 represents 10% of the total swap fee.',
    example: AlgebraPoolExample.communityFee,
  })
  readonly communityFee!: number;

  @ApiProperty({
    description: `
The plugin contract attached to this pool, including its address and configuration.

Plugins in Algebra Integral are conceptually similar to Uniswap V4 Hooks and allow modular logic
to be executed at specific lifecycle points (e.g., dynamic fee calculation, oracle updates,
or custom volatility tracking).

If the pool does not have a plugin configured, this field is 'null'.
`,
    type: AlgebraPoolPlugin,
    externalDocs: {
      url: 'https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/plugins',
      description: 'Algebra Integral Plugin Specification',
    },
    example: AlgebraPoolExample.plugin,
    nullable: true,
  })
  readonly plugin!: AlgebraPoolPlugin | null;
}
