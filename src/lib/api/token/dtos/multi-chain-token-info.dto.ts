import { IMultiChainTokenInfo } from '@core/interfaces/token/multi-chain-token-info.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { ObjectCost } from '@lib/api/pricing/decorators/object-cost.decorator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { MultiChainTokenMetadata, MultiChainTokenMetadataExample } from './multi-chain-token-metadata.dto';

export const MultiChainTokenInfoExample: IMultiChainTokenInfo = {
  ...MultiChainTokenMetadataExample,
  totalValuePooledUsd: 6500000000.0,
};

@ApiSchema({
  name: 'MultiChainTokenInfo',
  description: `Detailed information about a multi-chain token`,
})
@ObjectCost(15)
export class MultiChainTokenInfo extends MultiChainTokenMetadata implements IMultiChainTokenInfo {
  @ApiProperty({
    description:
      'Represents the total USD value in pools of this token asset across all underlying chains. Calculated as the sum of Total Value Pooled of each individual single-chain token in this group.',
    example: MultiChainTokenInfoExample.totalValuePooledUsd,
  })
  @RoundUsd()
  totalValuePooledUsd!: number;
}
