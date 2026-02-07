import { ApiProperty } from '@nestjs/swagger';

export class TokenNotFoundMetadata {
  @ApiProperty({ description: 'The requested token address' })
  tokenAddress!: string;

  @ApiProperty({ description: 'The value of the chain ID', example: 1 })
  chainId!: number;
}
