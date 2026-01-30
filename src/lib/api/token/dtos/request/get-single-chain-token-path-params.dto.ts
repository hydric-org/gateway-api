import { ChainId } from '@core/enums/chain-id';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetSingleChainTokenPathParams {
  @ApiProperty({
    description: 'The numeric ID of the blockchain where the token resides.',
    example: ChainId.ETHEREUM,
    type: Number,
  })
  @IsNotEmpty()
  @IsEnum(ChainId)
  @Type(() => Number)
  chainId!: ChainId;

  @ApiProperty({
    description: 'The Token contract address.',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  tokenAddress!: string;
}
