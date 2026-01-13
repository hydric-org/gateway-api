import { IHook } from '@core/interfaces/hook.interface';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';

export const PoolHookOutputDTOExample = {
  address: '0x4440854B2d02C57A0Dc5c58b7A884562D875c0c4',
} satisfies IHook;

@ApiSchema({
  description: `
**Pool Hook Model**

Represents the custom logic layer (Hook) attached to a [V4PoolOutputDTO](${getSchemaPath(PoolHookOutputDTO)}). 

Hooks are external contracts that intercept the pool's execution flow at specific lifecycle points (e.g., before/after swaps or liquidity modifications). 
This model contains relevant data about the hook contract, including its address. 
  `,
})
export class PoolHookOutputDTO implements IHook {
  @ApiProperty({
    description: 'The address of the hook contract at the network.',
    example: PoolHookOutputDTOExample.address,
  })
  readonly address!: string;
}
