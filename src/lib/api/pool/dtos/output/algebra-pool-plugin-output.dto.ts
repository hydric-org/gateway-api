import { IAlgebraPoolPlugin } from '@core/interfaces/algebra-plugin.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const AlgebraPoolPluginExample = {
  address: '0x778A933d684F310CAf470FBf4fc7E40F3F3ef0c6',
  config: 195,
} satisfies IAlgebraPoolPlugin;

@ApiSchema({
  description: `
**Algebra Plugin Model**

Represents a modular extension (Plugin) attached to an [AlgebraPool](#/components/schemas/AlgebraPool). 
Unlike static pools, Plugins enable dynamic features like volatility-based fees, limit orders, or custom oracles 
by intercepting pool lifecycle events.
  `,
})
export class AlgebraPoolPlugin implements IAlgebraPoolPlugin {
  @ApiProperty({
    description: 'The address of the algebra plugin contract at the network.',
    example: AlgebraPoolPluginExample.address,
  })
  address!: string;

  @ApiProperty({
    description:
      'Bitmask representing the enabled capabilities of the Algebra plugin. Each bit corresponds to a specific behavior defined by the Algebra protocol (e.g., dynamic fee logic).',
    externalDocs: {
      url: 'https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/plugins',
      description: 'Algebra plugin capability specification',
    },
    example: AlgebraPoolPluginExample.config,
  })
  config!: number;
}
