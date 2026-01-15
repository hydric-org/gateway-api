import { IAlgebraLiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/algebra-liquidity-pool-metadata.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { AlgebraLiquidityPoolPlugin, AlgebraLiquidityPoolPluginExample } from './algebra-liquidity-pool-plugin.dto';
import { V3LiquidityPoolMetadata } from './v3-liquidity-pool-metadata.dto';

export const AlgebraLiquidityPoolMetadataExample = {
  deployer: '0x4440854B2d02C57A0Dc5c58b7A884562D875c0c4',
  version: '1.2.2',
  communityFeePercentage: 100,
  plugin: AlgebraLiquidityPoolPluginExample,
  latestSqrtPriceX96: '1564073352721610496185854744476',
  latestTick: '201235',
  tickSpacing: 60,
  positionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
} satisfies AlgebraLiquidityPoolMetadata;

@ApiSchema({
  description: 'Technical state and architectural configuration for Algebra Integral (Modular V3) pools',
})
export class AlgebraLiquidityPoolMetadata extends V3LiquidityPoolMetadata implements IAlgebraLiquidityPoolMetadata {
  @ApiProperty({
    description: `
  The address that initiated the pool deployment. 
  
  * **Standard Pools:** Returns the Zero Address (0x0...) for pools deployed via the default factory.
  * **Custom/Permissioned Pools:** Returns the specific address of the deployer for non-standard or private pool instances.
  `,
    example: AlgebraLiquidityPoolMetadataExample.deployer,
  })
  readonly deployer!: string;

  @ApiProperty({
    description: 'The specific version of the Algebra core/integral logic used by this pool instance.',
    example: AlgebraLiquidityPoolMetadataExample.version,
  })
  readonly version!: string;

  @ApiProperty({
    description: 'The protocol-level "cut" taken from the total swap fee represented in a percentage',
    example: AlgebraLiquidityPoolMetadataExample.communityFeePercentage,
  })
  readonly communityFeePercentage!: number;

  @ApiProperty({
    description: `
  The plugin contract attached to this pool, including its address and configuration.
  
  Plugins in Algebra Integral are conceptually similar to Uniswap V4 Hooks and allow modular logic
  to be executed at specific lifecycle points (e.g., dynamic fee calculation, oracle updates,
  or custom volatility tracking).
  
  If the pool does not have a plugin configured, this field is 'null'.
  `,
    type: AlgebraLiquidityPoolPlugin,
    externalDocs: {
      url: 'https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/plugins',
      description: 'Algebra Integral Plugin Specification',
    },
    example: AlgebraLiquidityPoolMetadataExample.plugin,
    nullable: true,
  })
  readonly plugin!: AlgebraLiquidityPoolPlugin | null;
}
