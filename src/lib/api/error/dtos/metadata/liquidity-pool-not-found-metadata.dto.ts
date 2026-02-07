import { ApiProperty } from '@nestjs/swagger';

export class LiquidityPoolNotFoundMetadata {
  @ApiProperty({ description: 'The requested liquidity pool address' })
  liquidityPoolAddress!: string;

  @ApiProperty({ description: 'The value of the chain ID', example: 1 })
  chainId!: number;
}
