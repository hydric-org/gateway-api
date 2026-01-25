import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetTokenByAddressPathParams {
  @ApiProperty({
    description: 'The Token contract address to search for.',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  tokenAddress!: string;
}
