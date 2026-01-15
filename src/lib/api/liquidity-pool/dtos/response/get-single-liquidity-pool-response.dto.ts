import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { LiquidityPool } from '../liquidity-pool.dto';

@ApiSchema({
  description: 'Response object for retrieving a single liquidity pool.',
})
export class GetSingleLiquidityPoolResponse {
  @ApiProperty({
    description: 'The liquidity pool data.',
    type: () => LiquidityPool,
  })
  readonly pool!: LiquidityPool;
}
