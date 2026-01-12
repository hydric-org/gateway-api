import { IProtocol } from '@core/interfaces/protocol.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const ProtocolOutputDTOExample = {
  id: 'somedex-id',
  name: 'Somedex Name',
  url: 'https://somedex.com',
  logo: 'https://somedex.com/logo.png',
} satisfies ProtocolOutputDTO;

@ApiSchema({
  description: `
**Protocol Identity Model**

Represents the organizational entity hosting the liquidity pool (e.g., Uniswap V3, PancakeSwap Infinity). 
This model provides the canonical naming, external links, and brand assets required for cross-protocol interfaces.
  `,
})
export class ProtocolOutputDTO implements IProtocol {
  @ApiProperty({
    description: 'The slug or unique string-based identifier for the protocol (e.g., "uniswap-v3").',
    example: ProtocolOutputDTOExample.id,
  })
  readonly id!: string;

  @ApiProperty({
    description: 'The official commercial name of the protocol used for display purposes.',
    example: ProtocolOutputDTOExample.name,
  })
  readonly name!: string;

  @ApiProperty({
    description: 'The primary landing page or official website for the protocol.',
    example: ProtocolOutputDTOExample.url,
  })
  readonly url!: string;

  @ApiProperty({
    description: 'A canonical URL pointing to the protocol icon or brand logo (usually in SVG or high-res PNG format).',
    example: ProtocolOutputDTOExample.logo,
  })
  readonly logo!: string;
}
