import { _Internal_BilledObjectResponse } from '@lib/api/pricing/dtos/billed-object-response.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { LiquidityPool } from '../liquidity-pool.dto';

@ApiSchema({
  description: 'Response object for retrieving a single liquidity pool.',
})
export class GetSingleLiquidityPoolResponse extends _Internal_BilledObjectResponse {
  @ApiProperty({
    description: 'The liquidity pool data.',
    type: () => LiquidityPool,
  })
  readonly pool: LiquidityPool;

  constructor(pool: LiquidityPool) {
    super({
      count: 1,
      objectType: LiquidityPool,
    });

    this.pool = pool;
  }
}
