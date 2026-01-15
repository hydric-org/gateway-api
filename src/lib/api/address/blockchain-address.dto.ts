import { ChainId } from '@core/enums/chain-id';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';

@ApiSchema({
  description: 'An address that is tied to a blockchain',
})
export class BlockchainAddress implements IBlockchainAddress {
  constructor(chainId: ChainId, address: string) {
    this.chainId = chainId;
    this.address = address;
  }

  @ApiProperty({
    description: 'The chain id of the address. Must be one of the supported networks',
    enum: ChainId,
    example: 1,
  })
  @Type(() => Number)
  readonly chainId: ChainId;

  @ApiProperty({
    description: 'The address tied to the blockchain',
    example: '0x0000000000000000000000000000000000000000',
  })
  readonly address: string;
}
