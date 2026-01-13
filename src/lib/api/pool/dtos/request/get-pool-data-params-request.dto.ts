import { Network } from '@core/enums/network';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPoolAddress } from '../../validators/is-pool-address.validator';

export class GetPoolDataParamsRequestDTO {
  @ApiProperty({
    description: `
The address of the pool:
* **Standard Format:** A 42 character Ethereum contract address.
* **V4 Format:** A bytes32 Pool ID hex string`,
    example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
  })
  @IsPoolAddress()
  poolAddress!: string;

  @ApiProperty({
    description: 'The chain id of the pool. This must be a supported network chain id.',
    example: 1,
    enum: Network,
  })
  @isSupportedChainId()
  chainId!: Network;
}
