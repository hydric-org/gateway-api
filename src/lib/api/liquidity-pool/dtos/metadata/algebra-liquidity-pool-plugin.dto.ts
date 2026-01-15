import { IAlgebraLiquidityPoolPlugin } from '@core/interfaces/algebra-liquidity-pool-plugin.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const AlgebraLiquidityPoolPluginExample = {
  address: '0x778A933d684F310CAf470FBf4fc7E40F3F3ef0c6',
  config: 195,
} satisfies IAlgebraLiquidityPoolPlugin;

@ApiSchema({
  description: 'Relevant information about the plugin of an algebra liquidity pool',
})
export class AlgebraLiquidityPoolPlugin implements IAlgebraLiquidityPoolPlugin {
  @ApiProperty({
    description: 'The contract address of the Algebra plugin',
    example: AlgebraLiquidityPoolPluginExample.address,
  })
  readonly address!: string;

  @ApiProperty({
    description:
      'Bitmask representing the enabled capabilities of the Algebra plugin. Each bit corresponds to a specific behavior defined by the Algebra protocol (e.g., dynamic fee logic).',
    externalDocs: {
      url: 'https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/plugins',
      description: 'Algebra plugin capability specification',
    },
    example: AlgebraLiquidityPoolPluginExample.config,
  })
  readonly config!: number;
}
