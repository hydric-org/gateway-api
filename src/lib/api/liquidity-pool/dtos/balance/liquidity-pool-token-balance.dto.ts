import { ILiquidityPoolTokenBalance } from '@core/interfaces/liquidity-pool/balance/liquidity-pool-token-balance.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { Round } from '@lib/api/common/transformers/round.transformer';
import {
  SingleChainTokenMetadata,
  SingleChainTokenMetadataExample,
} from '@lib/api/token/dtos/single-chain-token-metadata.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export const LiquidityPoolTokenBalanceExample = {
  amount: 21.3,
  amountUsd: 113000.21,
  token: SingleChainTokenMetadataExample,
} satisfies LiquidityPoolTokenBalance;

@ApiSchema({
  description: 'A normalized representation of a specific token reserve inside a pool.',
})
export class LiquidityPoolTokenBalance implements ILiquidityPoolTokenBalance {
  @ApiProperty({
    description: 'The human-readable token balance, adjusted for decimals (normalized).',
    example: LiquidityPoolTokenBalanceExample.amount,
    type: 'number',
  })
  @Round(18)
  readonly amount!: number;

  @ApiProperty({
    description: 'The current market value of the token reserve inside the pool denominated in USD.',
    example: LiquidityPoolTokenBalanceExample.amountUsd,
    type: 'number',
  })
  @RoundUsd()
  readonly amountUsd!: number;

  @ApiProperty({
    description: 'The metadata of the underlying blockchain token.',
    type: () => SingleChainTokenMetadata,
    example: LiquidityPoolTokenBalanceExample.token,
  })
  readonly token!: SingleChainTokenMetadata;
}
