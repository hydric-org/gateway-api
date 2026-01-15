import { IV4LiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/v4-liquidity-pool-metadata.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { V4LiquidityPoolHook, V4LiquidityPoolHookExample } from './v4-liquidity-pool-hook.dto';

export const V4LiquidityPoolMetadataExample: IV4LiquidityPoolMetadata = {
  stateViewAddress: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227',
  poolManagerAddress: '0x000000000004444c5dc75cb358380d2e3de08a90',
  tickSpacing: 60,
  latestTick: '201235',
  permit2Address: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  latestSqrtPriceX96: '1564073352721610496185854744476',
  hook: V4LiquidityPoolHookExample,
  positionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
};

@ApiSchema({
  description: 'Architectural specifications and state for Uniswap V4 (Singleton) pools',
})
export class V4LiquidityPoolMetadata implements IV4LiquidityPoolMetadata {
  @ApiProperty({
    description:
      'The periphery StateView contract used for off-chain state queries. May be null if the protocol uses a custom implementation of V4 Architecture. Like the Pancake Swap Infinity CL',
    examples: [V4LiquidityPoolMetadataExample.stateViewAddress, null],
    nullable: true,
  })
  readonly stateViewAddress!: string | null;

  @ApiProperty({
    description: 'The core V4 Singleton contract address that manages all pool states.',
    example: V4LiquidityPoolMetadataExample.poolManagerAddress,
  })
  readonly poolManagerAddress!: string;

  @ApiProperty({
    description: 'The minimum granularity of price ranges (ticks) for this pool (e.g., 60 for 0.3% fee pools).',
    examples: [V4LiquidityPoolMetadataExample.tickSpacing],
  })
  readonly tickSpacing!: number;

  @ApiProperty({
    description: 'The integer index representing the current price ($1.0001^{tick}$).',
    example: V4LiquidityPoolMetadataExample.latestTick,
  })
  readonly latestTick!: string;

  @ApiProperty({
    description: 'The Permit2 contract used for token approvals and signature-based transfers for this pool.',
    example: V4LiquidityPoolMetadataExample.permit2Address,
  })
  readonly permit2Address!: string;

  @ApiProperty({
    description:
      'The latest sqrtPriceX96 value. Represented as a string to preserve precision for BigInt calculations.',
    example: V4LiquidityPoolMetadataExample.latestSqrtPriceX96,
  })
  readonly latestSqrtPriceX96!: string;

  @ApiProperty({
    description:
      'Information about the hook of the v4 liquidity pool if it exists. In case that this pool has no hooks attached, this field will be null',
    examples: [V4LiquidityPoolHookExample, null],
    nullable: true,
  })
  readonly hook!: V4LiquidityPoolHook | null;

  @ApiProperty({
    description: 'The contract used to manage positions for v4 liquidity pools',
    example: V4LiquidityPoolMetadataExample.positionManagerAddress,
  })
  readonly positionManagerAddress!: string;
}
