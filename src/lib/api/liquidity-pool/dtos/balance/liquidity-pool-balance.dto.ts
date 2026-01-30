import { ChainId } from '@core/enums/chain-id';
import { ILiquidityPoolBalance } from '@core/interfaces/liquidity-pool/balance/liquidity-pool-balance.interface';
import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { LiquidityPoolTokenBalance } from './liquidity-pool-token-balance.dto';

export const LiqudityPoolBalanceExample = {
  totalValueLockedUsd: 13224.324,
  tokens: [
    {
      amount: 21.3,
      amountUsd: 113000.21,
      token: {
        chainId: ChainId.ETHEREUM,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
        logoUrl:
          'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/eth.png',
        totalValuePooledUsd: 13000,
      },
    },
    {
      amount: 21.3,
      amountUsd: 21.4,
      token: {
        chainId: ChainId.ETHEREUM,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        name: 'USDT',
        symbol: 'USDT',
        logoUrl:
          'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/usdt.png',
        totalValuePooledUsd: 500,
      },
    },
  ],
} satisfies LiquidityPoolBalance;

@ApiSchema({
  description: 'The aggregate financial state and tokens inventory of a liquidity pool.',
})
export class LiquidityPoolBalance implements ILiquidityPoolBalance {
  @ApiProperty({
    description: 'The aggregate USD value of all assets held within the pool (Total Value Locked).',
    example: LiqudityPoolBalanceExample.totalValueLockedUsd,
  })
  @RoundUsd()
  readonly totalValueLockedUsd!: number;

  @ApiProperty({
    description: 'The detailed breakdown of individual token reserves and their USD-denominated values.',
    type: () => [LiquidityPoolTokenBalance],
    example: LiqudityPoolBalanceExample.tokens,
  })
  readonly tokens!: LiquidityPoolTokenBalance[];
}
