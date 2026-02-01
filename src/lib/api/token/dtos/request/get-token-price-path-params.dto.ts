import { ChainId } from '@core/enums/chain-id';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetTokenPricePathParams {
  @ApiProperty({
    description: 'The numeric ID of the blockchain where the token resides.',
    example: ChainId.ETHEREUM,
    enum: ChainId,
  })
  @IsNotEmpty()
  @IsEnum(ChainId)
  @isSupportedChainId()
  @Type(() => Number)
  chainId!: ChainId;

  @ApiProperty({
    description: 'The Token contract address.',
    example: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  tokenAddress!: string;
}
