import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetPoolsQuery_query_root_Pool_Pool } from 'src/gen/graphql.gen';
import { ZERO_ETHEREUM_ADDRESS } from './constants';
import { PoolDTO } from './dtos/pool.dto';
import { V3PoolDTO } from './dtos/v3-pool.dto';
import { V4PoolDTO } from './dtos/v4-pool.dto';
import { NetworksUtils } from './enums/networks';
import { TokenRepository } from './repositories/token-repository';
import { LiquidityPool } from './types';
import { maybeParsePoolWrappedToNativeAddress } from './utils/address-utils';
import { getPoolTotalStats, isLPDynamicFee, isWrappedNativePool } from './utils/pool-utils';

@Injectable()
export class RawQueryParser {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async parseRawPoolsQuery(
    poolsQueryResponse: GetPoolsQuery_query_root_Pool_Pool[],
    params: {
      parseWrappedToNativePerChain: Record<number, boolean>;
      returnV4WrappedPoolsPerChain: Record<number, boolean>;
    },
  ): Promise<LiquidityPool[]> {
    const matchedPools: LiquidityPool[] = [];

    const tokensAddressesPerNetwork: Record<number, Set<string>> = {
      ...NetworksUtils.values().reduce((previousValue, network) => ({ ...previousValue, [network]: new Set([]) }), {}),
    };

    poolsQueryResponse.forEach((pool, index) => {
      poolsQueryResponse[index] = pool = {
        ...pool,
        token0: {
          tokenAddress: params.parseWrappedToNativePerChain[pool.chainId]
            ? maybeParsePoolWrappedToNativeAddress(pool.token0!.tokenAddress, pool.chainId, pool.poolType)
            : pool.token0!.tokenAddress,
        },
        token1: {
          tokenAddress: params.parseWrappedToNativePerChain[pool.chainId]
            ? maybeParsePoolWrappedToNativeAddress(pool.token1!.tokenAddress, pool.chainId, pool.poolType)
            : pool.token1!.tokenAddress,
        },
      };

      tokensAddressesPerNetwork[pool.chainId].add(pool.token0!.tokenAddress);
      tokensAddressesPerNetwork[pool.chainId].add(pool.token1!.tokenAddress);
    });

    const tokensMetadatas = await this.tokenRepository.getManyTokensFromManyNetworks(tokensAddressesPerNetwork);

    for (const pool of poolsQueryResponse) {
      /// Remove v4 pools that has Wrapped Native token due to the search for V3 Pools
      if (isWrappedNativePool(pool) && pool.poolType === 'V4' && !params.returnV4WrappedPoolsPerChain[pool.chainId]) {
        continue;
      }

      const poolStats = getPoolTotalStats(pool.dailyData, pool.hourlyData, Number(pool.totalValueLockedUSD));

      const basePool: PoolDTO = {
        chainId: pool.chainId,
        poolAddress: pool.poolAddress,
        createdAtTimestamp: Number(pool.createdAtTimestamp),
        totalValueLockedUSD: Number(pool.totalValueLockedUSD),
        total24hStats: {
          totalNetInflow: poolStats.totalStats24h.totalNetInflow,
          totalFees: poolStats.totalStats24h.totalFees,
          totalVolume: poolStats.totalStats24h.totalVolume,
          yield: poolStats.totalStats24h.yield,
        },
        total7dStats: {
          totalNetInflow: poolStats.totalStats7d.totalNetInflow,
          totalFees: poolStats.totalStats7d.totalFees,
          totalVolume: poolStats.totalStats7d.totalVolume,
          yield: poolStats.totalStats7d.yield,
        },
        total30dStats: {
          totalNetInflow: poolStats.totalStats30d.totalNetInflow,
          totalFees: poolStats.totalStats30d.totalFees,
          totalVolume: poolStats.totalStats30d.totalVolume,
          yield: poolStats.totalStats30d.yield,
        },
        total90dStats: {
          totalNetInflow: poolStats.totalStats90d.totalNetInflow,
          totalFees: poolStats.totalStats90d.totalFees,
          totalVolume: poolStats.totalStats90d.totalVolume,
          yield: poolStats.totalStats90d.yield,
        },
        poolType: pool.poolType,
        protocol: {
          id: pool.protocol!.id,
          logo: pool.protocol!.logo,
          name: pool.protocol!.name,
          url: pool.protocol!.url,
        },
        token0: tokensMetadatas[pool.chainId][pool.token0!.tokenAddress],
        token1: tokensMetadatas[pool.chainId][pool.token1!.tokenAddress],
        positionManagerAddress: pool.positionManager,
        initialFeeTier: pool.initialFeeTier,
        currentFeeTier: pool.currentFeeTier,
      };

      if (pool.poolType === 'V3') {
        const v3Pool: V3PoolDTO = {
          ...basePool,
          latestSqrtPriceX96: pool.v3PoolData!.sqrtPriceX96,
          tickSpacing: pool.v3PoolData!.tickSpacing,
          latestTick: pool.v3PoolData!.tick,
          deployerAddress: pool.algebraPoolData?.deployer,
        };

        matchedPools.push(v3Pool);
        continue;
      }

      if (pool.poolType === 'V4') {
        const v4Pool: V4PoolDTO = {
          ...basePool,
          latestSqrtPriceX96: pool.v4PoolData!.sqrtPriceX96,
          tickSpacing: pool.v4PoolData!.tickSpacing,
          latestTick: pool.v4PoolData!.tick,
          permit2Address: pool.v4PoolData!.permit2,
          poolManagerAddress: pool.v4PoolData!.poolManager,
          stateViewAddress: pool.v4PoolData!.stateView ?? null,
          hook:
            pool.v4PoolData!.hooks !== ZERO_ETHEREUM_ADDRESS
              ? {
                  address: pool.v4PoolData!.hooks,
                  isDynamicFee: isLPDynamicFee(pool.initialFeeTier),
                }
              : null,
        };

        matchedPools.push(v4Pool);
        continue;
      }

      throw new InternalServerErrorException(`Unsupported pool type received: ${pool.poolType}`);
    }

    return matchedPools;
  }
}
