import { ApiProperty } from '@nestjs/swagger';

export class TokenBasketNotFoundMetadata {
  @ApiProperty({ description: 'The requested basket identifier' })
  basketId!: string;

  @ApiProperty({ description: 'The value of the chain ID', example: 1 })
  chainId!: number;
}
