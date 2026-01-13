import { PoolType } from '@core/enums/pool/pool-type';
import { IPool } from '@core/interfaces/pool/pool.interface';

import { RoundUsd } from '@lib/api/common/transformers/round-usd-transformer';
import { ProtocolOutputDTO, ProtocolOutputDTOExample } from '@lib/api/protocol/dtos/protocol-output.dto';
import {
  SingleChainTokenOutputDTO,
  SingleChainTokenOutputDTOExample,
} from '@lib/api/token/dtos/single-chain-token-output.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Network } from 'src/core/enums/network';
import { PoolTimeframedStatsOutputDTO, PoolTimeframedStatsOutputDTOExample } from './pool-timeframed-stats.dto';

export const PoolOutputDTOExample = {
  poolAddress: '0x8ad599c3a01ae48104127aeeb893430d0bc41221',
  token0: SingleChainTokenOutputDTOExample,
  token1: SingleChainTokenOutputDTOExample,
  protocol: ProtocolOutputDTOExample,
  chainId: Network.ETHEREUM,
  createdAtTimestamp: 1768070830,
  currentFeeTier: 100,
  initialFeeTier: 100,
  isDynamicFee: false,
  poolType: PoolType.V3,
  positionManagerAddress: '0x0000000000000000000000000000000000000000',
  total24hStats: PoolTimeframedStatsOutputDTOExample,
  total7dStats: PoolTimeframedStatsOutputDTOExample,
  total30dStats: PoolTimeframedStatsOutputDTOExample,
  total90dStats: PoolTimeframedStatsOutputDTOExample,
  totalValueLockedUsd: 143244.54,
} satisfies PoolOutputDTO;

@ApiSchema({
  description: `
**Base Pool Model**

The primary data structure representing a liquidity pool. This model acts as the "Common Schema" for all supported protocol versions.

### Polymorphism
The \`poolType\` field serves as the discriminator. Depending on its value, the API response will include additional specific properties. 
Refer to the following specialized schemas for extended data:

* [V2PoolOutputDTO](#/components/schemas/V2PoolOutputDTO)
* [V3PoolOutputDTO](#/components/schemas/V3PoolOutputDTO)
* [V4PoolOutputDTO](#/components/schemas/V4PoolOutputDTO)
* [AlgebraPoolOutputDTO](#/components/schemas/AlgebraPoolOutputDTO)
* [SlipstreamPoolOutputDTO](#/components/schemas/SlipstreamPoolOutputDTO)
  `,
})
export class PoolOutputDTO implements IPool {
  @ApiProperty({
    description: `
The unique identity for the pool on its native blockchain.

* **Address Format (EVM Standard):** Used by V2, V3, Algebra, and Slipstream. 
* **ID Format (V4 Singleton):** A bytes32 hex string uniquely identifying the pool within the V4 Manager contract.
    `,
    example: PoolOutputDTOExample.poolAddress,
  })
  readonly poolAddress!: string;

  @ApiProperty({
    description: 'The primary token (Token 0) in the pair. Canonical ordering is determined by contract-level sorting.',
    type: () => SingleChainTokenOutputDTO,
    example: PoolOutputDTOExample.token0,
  })
  readonly token0!: SingleChainTokenOutputDTO;

  @ApiProperty({
    description: 'The secondary token (Token 1) in the pair.',
    type: () => SingleChainTokenOutputDTO,
    example: PoolOutputDTOExample.token1,
  })
  readonly token1!: SingleChainTokenOutputDTO;

  @ApiProperty({
    description: 'Metadata regarding the DEX protocol (e.g., Uniswap, PancakeSwap) hosting the pool.',
    type: () => ProtocolOutputDTO,
    example: PoolOutputDTOExample.protocol,
  })
  readonly protocol!: ProtocolOutputDTO;

  @ApiProperty({
    description:
      'Unix timestamp (seconds) of the block where the pool was first initialized or tracked by our indexer.',
    example: PoolOutputDTOExample.createdAtTimestamp,
  })
  readonly createdAtTimestamp!: number;

  @ApiProperty({
    description: 'The network (Chain ID) where this pool is deployed. Follows EIP-155 standards.',
    example: PoolOutputDTOExample.chainId,
    enum: Network,
  })
  readonly chainId!: Network;

  @ApiProperty({
    description: 'The current dollar-denominated value of all underlying liquidity assets in the pool.',
    example: PoolOutputDTOExample.totalValueLockedUsd,
  })
  @RoundUsd()
  readonly totalValueLockedUsd!: number;

  @ApiProperty({
    description: 'The architectural engine of the pool. Use this field to cast the response to its specific subtype.',
    example: PoolOutputDTOExample.poolType,
    enum: PoolType,
  })
  readonly poolType!: PoolType;

  @ApiProperty({
    description:
      'The helper contract used for minting/burning and managing liquidity positions (e.g., NonfungiblePositionManager).',
    example: PoolOutputDTOExample.positionManagerAddress,
  })
  readonly positionManagerAddress!: string;

  @ApiProperty({
    description:
      'The static fee tier set at deployment, represented in hundredths of a basis point (1 unit = 0.0001%).',
    example: PoolOutputDTOExample.initialFeeTier,
  })
  readonly initialFeeTier!: number;

  @ApiProperty({
    description: 'The real-time fee tier currently being applied to swaps. May vary if `isDynamicFee` is true.',
    example: PoolOutputDTOExample.currentFeeTier,
  })
  readonly currentFeeTier!: number;

  @ApiProperty({
    description:
      'If true, the swap fee is controlled by a plugin, hook, or volatility oracle rather than remaining static.',
    example: PoolOutputDTOExample.isDynamicFee,
  })
  readonly isDynamicFee!: boolean;

  @ApiProperty({
    description: 'Performance metrics (volume, fees, yield) for the rolling 24-hour period.',
    type: () => PoolTimeframedStatsOutputDTO,
    example: PoolOutputDTOExample.total24hStats,
  })
  readonly total24hStats!: PoolTimeframedStatsOutputDTO;

  @ApiProperty({
    description: 'Performance metrics for the rolling 7-day period.',
    type: () => PoolTimeframedStatsOutputDTO,
    example: PoolOutputDTOExample.total7dStats,
  })
  readonly total7dStats!: PoolTimeframedStatsOutputDTO;

  @ApiProperty({
    description: 'Performance metrics for the rolling 30-day period.',
    type: () => PoolTimeframedStatsOutputDTO,
    example: PoolOutputDTOExample.total30dStats,
  })
  readonly total30dStats!: PoolTimeframedStatsOutputDTO;

  @ApiProperty({
    description: 'Performance metrics for the rolling 90-day period.',
    type: () => PoolTimeframedStatsOutputDTO,
    example: PoolOutputDTOExample.total90dStats,
  })
  readonly total90dStats!: PoolTimeframedStatsOutputDTO;
}
