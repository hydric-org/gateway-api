import { IV3LiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/v3-liquidity-pool-metadata.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const V3LiquidityPoolMetadataExample: IV3LiquidityPoolMetadata = {
  tickSpacing: 60,
  latestTick: '201235',
  latestSqrtPriceX96: '1564073352721610496185854744476',
  positionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
};

@ApiSchema({
  description:
    'Technical state for Concentrated Liquidity (V3) pools, including tick-level precision and price encoding.',
})
export class V3LiquidityPoolMetadata implements IV3LiquidityPoolMetadata {
  @ApiProperty({
    description: 'The current square root price in Q64.96 format. Use this for high-precision swap math.',
    example: V3LiquidityPoolMetadataExample.latestSqrtPriceX96,
  })
  readonly latestSqrtPriceX96!: string;

  @ApiProperty({
    description: 'The integer index representing the current price ($1.0001^{tick}$).',
    example: V3LiquidityPoolMetadataExample.latestTick,
  })
  readonly latestTick!: string;

  @ApiProperty({
    description: 'The minimum granularity of price ranges (ticks) for this pool (e.g., 60 for 0.3% fee pools).',
    example: V3LiquidityPoolMetadataExample.tickSpacing,
  })
  readonly tickSpacing!: number;

  @ApiProperty({
    description: 'The address of the NonfungiblePositionManager responsible for Minting/Burning LP NFTs.',
    example: V3LiquidityPoolMetadataExample.positionManagerAddress,
  })
  readonly positionManagerAddress!: string;
}
