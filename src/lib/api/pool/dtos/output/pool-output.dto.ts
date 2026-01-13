import { PoolType } from '@core/enums/pool/pool-type';
import { IPool } from '@core/interfaces/pool/pool.interface';

import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { Protocol, ProtocolExample } from '@lib/api/protocol/dtos/protocol-output.dto';
import { SingleChainToken, SingleChainTokenExample } from '@lib/api/token/dtos/single-chain-token-output.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Network } from 'src/core/enums/network';
import { PoolStats, PoolStatsExample } from './pool-timeframed-stats.dto';

export const PoolExample = {
  poolAddress: '0x8ad599c3a01ae48104127aeeb893430d0bc41221',
  token0: SingleChainTokenExample,
  token1: SingleChainTokenExample,
  protocol: ProtocolExample,
  chainId: Network.ETHEREUM,
  createdAtTimestamp: 1768070830,
  currentFeeTier: 100,
  initialFeeTier: 100,
  isDynamicFee: false,
  poolType: PoolType.V3,
  positionManagerAddress: '0x0000000000000000000000000000000000000000',
  total24hStats: PoolStatsExample,
  total7dStats: PoolStatsExample,
  total30dStats: PoolStatsExample,
  total90dStats: PoolStatsExample,
  totalValueLockedUsd: 143244.54,
} satisfies Pool;

@ApiSchema({
  description: `
**Base Pool Model**

The primary data structure representing a liquidity pool. This model acts as the "Common Schema" for all supported protocol versions.

### Polymorphism
The \`poolType\` field serves as the discriminator. Depending on its value, the API response will include additional specific properties. 
Refer to the following specialized schemas for extended data:

* [V3Pool](#/components/schemas/V3Pool)
* [V4Pool](#/components/schemas/V4Pool)
* [AlgebraPool](#/components/schemas/AlgebraPool)
* [SlipstreamPool](#/components/schemas/SlipstreamPool)
  `,
})
export class Pool implements IPool {
  @ApiProperty({
    description: `
The unique identity for the pool on its native blockchain.

* **Address Format (EVM Standard):** Used by V2, V3, Algebra, and Slipstream. 
* **ID Format (V4 Singleton):** A bytes32 hex string uniquely identifying the pool within the V4 Manager contract.
    `,
    example: PoolExample.poolAddress,
  })
  readonly poolAddress!: string;

  @ApiProperty({
    description: 'The primary token (Token 0) in the pair. Canonical ordering is determined by contract-level sorting.',
    type: () => SingleChainToken,
    example: PoolExample.token0,
  })
  readonly token0!: SingleChainToken;

  @ApiProperty({
    description: 'The secondary token (Token 1) in the pair.',
    type: () => SingleChainToken,
    example: PoolExample.token1,
  })
  readonly token1!: SingleChainToken;

  @ApiProperty({
    description: 'Metadata regarding the DEX protocol (e.g., Uniswap, PancakeSwap) hosting the pool.',
    type: () => Protocol,
    example: PoolExample.protocol,
  })
  readonly protocol!: Protocol;

  @ApiProperty({
    description:
      'Unix timestamp (seconds) of the block where the pool was first initialized or tracked by our indexer.',
    example: PoolExample.createdAtTimestamp,
  })
  readonly createdAtTimestamp!: number;

  @ApiProperty({
    description: 'The network (Chain ID) where this pool is deployed. Follows EIP-155 standards.',
    example: PoolExample.chainId,
    enum: Network,
  })
  readonly chainId!: Network;

  @ApiProperty({
    description: 'The current dollar-denominated value of all underlying liquidity assets in the pool.',
    example: PoolExample.totalValueLockedUsd,
  })
  @RoundUsd()
  readonly totalValueLockedUsd!: number;

  @ApiProperty({
    description: 'The architectural engine of the pool. Use this field to cast the response to its specific subtype.',
    example: PoolExample.poolType,
    enum: PoolType,
  })
  readonly poolType!: PoolType;

  @ApiProperty({
    description:
      'The helper contract used for minting/burning and managing liquidity positions (e.g., NonfungiblePositionManager).',
    example: PoolExample.positionManagerAddress,
  })
  readonly positionManagerAddress!: string;

  @ApiProperty({
    description:
      'The static fee tier set at deployment, represented in hundredths of a basis point (1 unit = 0.0001%).',
    example: PoolExample.initialFeeTier,
  })
  readonly initialFeeTier!: number;

  @ApiProperty({
    description: 'The real-time fee tier currently being applied to swaps. May vary if `isDynamicFee` is true.',
    example: PoolExample.currentFeeTier,
  })
  readonly currentFeeTier!: number;

  @ApiProperty({
    description:
      'If true, the swap fee is controlled by a plugin, hook, or volatility oracle rather than remaining static.',
    example: PoolExample.isDynamicFee,
  })
  readonly isDynamicFee!: boolean;

  @ApiProperty({
    description: 'Performance metrics (volume, fees, yield) for the rolling 24-hour period.',
    type: () => PoolStats,
    example: PoolExample.total24hStats,
  })
  readonly total24hStats!: PoolStats;

  @ApiProperty({
    description: 'Performance metrics for the rolling 7-day period.',
    type: () => PoolStats,
    example: PoolExample.total7dStats,
  })
  readonly total7dStats!: PoolStats;

  @ApiProperty({
    description: 'Performance metrics for the rolling 30-day period.',
    type: () => PoolStats,
    example: PoolExample.total30dStats,
  })
  readonly total30dStats!: PoolStats;

  @ApiProperty({
    description: 'Performance metrics for the rolling 90-day period.',
    type: () => PoolStats,
    example: PoolExample.total90dStats,
  })
  readonly total90dStats!: PoolStats;
}
