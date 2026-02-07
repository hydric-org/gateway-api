import { ApiProperty } from '@nestjs/swagger';

export class InvalidLiquidityPoolAddressMetadata {
  @ApiProperty({ description: 'The requested liquidity pool address' })
  liquidityPoolAddress!: string;
}
