import { ISingleChainTokenInfo } from '@core/interfaces/token/single-chain-token-info.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { SingleChainTokenMetadata, SingleChainTokenMetadataExample } from './single-chain-token-metadata.dto';

export const SingleChainTokenInfoExample: ISingleChainTokenInfo = {
  ...SingleChainTokenMetadataExample,
  totalValuePooledUsd: 154000000.5,
};

@ApiSchema({
  description: 'Complete information about a token on a single blockchain, including pool metrics.',
})
@ObjectCost(5)
export class SingleChainTokenInfo extends SingleChainTokenMetadata implements ISingleChainTokenInfo {
  @ApiProperty({
    description: 'Represents the total USD value of this token currently locked in indexed liquidity pools.',
    example: SingleChainTokenInfoExample.totalValuePooledUsd,
  })
  @RoundUsd()
  readonly totalValuePooledUsd!: number;
}
