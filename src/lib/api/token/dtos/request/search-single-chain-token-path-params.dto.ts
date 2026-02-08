import { ChainId } from '@core/enums/chain-id';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSingleChainTokenPathParams {
  @ApiProperty({
    description: 'The chain id of the network. This must be a supported network chain id.',
    example: ChainId.MONAD,
    enum: ChainId,
  })
  @isSupportedChainId()
  chainId!: ChainId;
}
