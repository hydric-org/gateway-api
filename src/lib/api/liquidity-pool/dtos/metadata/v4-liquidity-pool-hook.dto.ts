import { IV4LiquidityPoolHook } from '@core/interfaces/v4-liquidity-pool-hook.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const V4LiquidityPoolHookExample = {
  address: '0x4440854B2d02C57A0Dc5c58b7A884562D875c0c4',
} satisfies IV4LiquidityPoolHook;

@ApiSchema({
  description: 'Relevant information about the hook of a v4 liquidity pool',
})
export class V4LiquidityPoolHook implements IV4LiquidityPoolHook {
  @ApiProperty({
    description: 'The address of the hook contract at the network of the liquidity pool.',
    example: V4LiquidityPoolHookExample.address,
  })
  readonly address!: string;
}
