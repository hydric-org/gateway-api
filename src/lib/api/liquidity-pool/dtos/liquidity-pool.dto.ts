import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { Network } from '@core/enums/network';
import { ILiquidityPool } from '@core/interfaces/liquidity-pool/liquidity-pool.interface';
import { ISingleChainToken } from '@core/interfaces/token/single-chain-token.interface';
import { LiquidityPoolMetadata } from '@core/types/liquidity-pool-metadata';
import { Protocol } from '@lib/api/protocol/dtos/protocol.dto';
import { SingleChainToken } from '@lib/api/token/dtos/single-chain-token.dto';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { LIQUIDITY_POOL_METADATA_TYPES } from '../liquidity-pool-metadata-types';
import { LiquidityPoolBalance } from './balance/liquidity-pool-balance.dto';
import { LiquidityPoolFeeTier } from './liquidity-pool-fee-tier.dto';
import { LiquidityPoolWindowedStats } from './liquidity-pool-windowed-stats.dto';
import { V4LiquidityPoolMetadataExample } from './metadata/v4-liquidity-pool-metadata.dto';

const token0: ISingleChainToken = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
};

const token1: ISingleChainToken = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  decimals: 18,
  name: 'USDC',
  symbol: 'USDC',
};
export const V3LiquidityPoolExample = {
  address: '0x8ad599c3a01ae48104127aeeb893430d0bc41221',
  tokens: [token0, token1],
  balance: {
    totalValueLockedUsd: 3001.32,
    tokens: [
      {
        amount: 1,
        amountUsd: 1500.11,
        token: token0,
      },
      {
        amount: 1500.11,
        amountUsd: 1501.21,
        token: token1,
      },
    ],
  },
  chainId: Network.ETHEREUM,
  createdAtTimestamp: 1768429616,
  feeTier: {
    feeTierPercentage: 0.4,
    isDynamic: false,
  },
  type: LiquidityPoolType.V3,
  stats: {
    stats24h: {
      feesUsd: 12450.55,
      swapVolumeUsd: 4124500.22,
      yield: 12.5,
      netInflowUsd: 450000,
      liquidityVolumeUsd: 120000,
    },
    stats7d: {
      feesUsd: 85400.12,
      swapVolumeUsd: 28450100.45,
      yield: 11.2,
      netInflowUsd: 1200000,
      liquidityVolumeUsd: 850000,
    },
    stats30d: {
      feesUsd: 345200.55,
      swapVolumeUsd: 115045000.11,
      yield: 10.8,
      netInflowUsd: 5400000,
      liquidityVolumeUsd: 3200000,
    },
    stats90d: {
      feesUsd: 1120400.88,
      swapVolumeUsd: 375200400.55,
      yield: 10.5,
      netInflowUsd: 12500000,
      liquidityVolumeUsd: 9800000,
    },
  },
  protocol: {
    id: 'uniswap-v3',
    logoUrl: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    name: 'Uniswap V3',
    url: 'https://app.uniswap.org',
  },
  metadata: {
    latestSqrtPriceX96: '1564073352721610496185854744476',
    tickSpacing: 60,
    latestTick: '201235',
    positionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },
} satisfies ILiquidityPool;

export const V4LiquidityPoolExample = {
  ...V3LiquidityPoolExample,
  type: LiquidityPoolType.V4,
  metadata: V4LiquidityPoolMetadataExample,
} satisfies ILiquidityPool;

@ApiSchema({
  description: `The universal interface for liquidity pools. hydric normalizes diverse protocol architectures (V2, V3, V4, Algebra) into this single, high-fidelity model. 

### Integration Strategy:
1. **Core Fields:** Use for portfolio tracking, analytics, and global search.
2. **Metadata:** Use for protocol-specific execution, such as calculating ticks or interacting with V4 hooks.`,
})
export class LiquidityPool implements ILiquidityPool {
  @ApiProperty({
    description: `The unique on-chain identifier for the pool. 
    - **Standard:** The contract address of the pool.
    - **V4 Singleton:** The unique 'poolId' (bytes32 hash) used by the Manager.`,
    example: V3LiquidityPoolExample.address,
  })
  readonly address!: string;

  @ApiProperty({
    description:
      'Deterministic list of assets in the pool. The array order strictly follows the protocol\'s internal "Token 0, 1... N" indexing.',
    example: V3LiquidityPoolExample.tokens,
  })
  readonly tokens!: SingleChainToken[];

  @ApiProperty({
    description: 'The aggregate inventory state, including Total Value Locked (TVL) and individual asset reserves.',
    type: () => LiquidityPoolBalance,
    example: V3LiquidityPoolExample.balance,
  })
  readonly balance!: LiquidityPoolBalance;

  @ApiProperty({
    description: 'The protocol that owns the liquidity pool and its metadata',
    type: () => Protocol,
    example: V3LiquidityPoolExample.protocol,
  })
  readonly protocol!: Protocol;

  @ApiProperty({
    description: 'Unix timestamp (seconds) of the block where the pool was created.',
    example: V3LiquidityPoolExample.createdAtTimestamp,
  })
  readonly createdAtTimestamp!: number;

  @ApiProperty({
    description:
      'The chain id where the liquidity pool is deployed. Following EIP-155 standards. Check out [Chainlist](https://chainlist.org) to discover the chain id of any EVM Blockchain',
    example: V3LiquidityPoolExample.chainId,
    enum: Network,
  })
  readonly chainId!: Network;

  @ApiProperty({
    description:
      'The architectural classification of the pool. This field acts as the discriminator for the polymorphic "metadata" object.',
    enum: LiquidityPoolType,
    example: V3LiquidityPoolExample.type,
  })
  readonly type!: LiquidityPoolType;

  @ApiProperty({
    description: 'Information about the fee tier of this Liquidity Pool',
    example: V3LiquidityPoolExample.feeTier,
    type: () => LiquidityPoolFeeTier,
  })
  readonly feeTier!: LiquidityPoolFeeTier;

  @ApiProperty({
    description: 'Dynamic performance data including volume, fees, and yield aggregated over rolling time windows.',
    type: () => LiquidityPoolWindowedStats,
    example: V3LiquidityPoolExample.stats,
  })
  readonly stats!: LiquidityPoolWindowedStats;

  @ApiProperty({
    description:
      'Deep architectural state (Ticks, Hooks, Plugins). The schema of this object is determined by the "type" field.',
    oneOf: LIQUIDITY_POOL_METADATA_TYPES.map((type) => ({
      title: type.name,
      $ref: getSchemaPath(type),
    })),
  })
  readonly metadata!: LiquidityPoolMetadata;
}
