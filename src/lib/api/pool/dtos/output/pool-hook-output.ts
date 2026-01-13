import { IHook } from '@core/interfaces/hook.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const PoolHookExample = {
  address: '0x4440854B2d02C57A0Dc5c58b7A884562D875c0c4',
} satisfies IHook;

@ApiSchema({
  description: `
**Pool Hook Model**

Represents the custom logic layer (Hook) attached to a [V4Pool](#/components/schemas/V4Pool). 

Hooks are external contracts that intercept the pool's execution flow at specific lifecycle points (e.g., before/after swaps or liquidity modifications). 
This model contains relevant data about the hook contract, including its address. 
  `,
})
export class PoolHook implements IHook {
  @ApiProperty({
    description: 'The address of the hook contract at the network.',
    example: PoolHookExample.address,
  })
  readonly address!: string;
}
