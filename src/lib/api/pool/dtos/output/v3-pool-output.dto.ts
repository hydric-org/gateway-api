import { PoolType } from '@core/enums/pool/pool-type';
import { IV3Pool } from '@core/interfaces/pool/v3-pool.interface';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { PoolOutputDTO, PoolOutputDTOExample } from './pool-output.dto';

export const V3PoolOutputDTOExample = {
  ...PoolOutputDTOExample,
  tickSpacing: 60,
  latestTick: '-195948',
  latestSqrtPriceX96: '4407031279310232521923433',
  poolType: PoolType.V3,
} satisfies V3PoolOutputDTO;

@ApiSchema({
  description: `
**V3 Pool Output Model**

Represents a concentrated liquidity pool following the Uniswap V3 architecture. 
This model extends the [PoolOutputDTO](${getSchemaPath(PoolOutputDTO)}) by providing 
specific state variables and additional metadata for V3 pools.
  `,
})
export class V3PoolOutputDTO extends PoolOutputDTO implements IV3Pool {
  @ApiProperty({
    description:
      'The minimum price increment between allowable initialization ranges (ticks). Smaller values allow for more granular liquidity positioning.',
    example: V3PoolOutputDTOExample.tickSpacing,
  })
  readonly tickSpacing!: number;

  @ApiProperty({
    description: 'The current active tick of the pool, representing the current price in logarithmic space.',
    example: V3PoolOutputDTOExample.latestTick,
  })
  readonly latestTick!: string;

  @ApiProperty({
    description:
      'The current square root of the price, encoded as a Q64.96 fixed-point number. Used to calculate token amounts without loss of precision.',
    example: V3PoolOutputDTOExample.latestSqrtPriceX96,
  })
  readonly latestSqrtPriceX96!: string;
}
