import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { PoolType } from '@core/enums/pool/pool-type';
import { IAlgebraPool } from '@core/interfaces/pool/algebra-pool.interface';
import { IPool } from '@core/interfaces/pool/pool.interface';
import { ISlipstreamPool } from '@core/interfaces/pool/slipstream-pool.interface';
import { IV3Pool } from '@core/interfaces/pool/v3-pool.interface';
import { IV4Pool } from '@core/interfaces/pool/v4-pool.interface';
import { LiquidityPool } from '@core/types';
import { GetPoolsQuery_query_root_Pool_Pool } from '@gen/graphql.gen';

export const PoolsIndexerResponseAdapter = {
  responseToLiquidityPoolList,
};

function responseToLiquidityPoolList(rawPools: GetPoolsQuery_query_root_Pool_Pool[]): LiquidityPool[] {
  const matchedPools: LiquidityPool[] = [];

  for (const pool of rawPools) {
    const basePool = _buildBasePool(pool);

    const specificPool = _parseSpecificPoolTypeFromBasePool(basePool, pool);
    matchedPools.push(specificPool);
  }

  return matchedPools;
}

function _buildBasePool(rawPool: GetPoolsQuery_query_root_Pool_Pool): IPool {
  return {
    chainId: rawPool.chainId,
    poolAddress: rawPool.poolAddress,
    createdAtTimestamp: Number(rawPool.createdAtTimestamp),
    totalValueLockedUsd: Number(rawPool.totalValueLockedUsd),
    total24hStats: {
      feesUsd: Number(rawPool.totalStats24h!.feesUsd),
      swapVolumeUsd: Number(rawPool.totalStats24h!.swapVolumeUsd),
      yield: Number(rawPool.totalStats24h!.yearlyYield),
      netInflowUsd: Number(rawPool.totalStats24h!.liquidityNetInflowUsd),
      liquidityVolumeUsd: Number(rawPool.totalStats24h!.liquidityVolumeUsd),
    },
    total7dStats: {
      feesUsd: Number(rawPool.totalStats7d!.feesUsd),
      swapVolumeUsd: Number(rawPool.totalStats7d!.swapVolumeUsd),
      yield: Number(rawPool.totalStats7d!.yearlyYield),
      netInflowUsd: Number(rawPool.totalStats7d!.liquidityNetInflowUsd),
      liquidityVolumeUsd: Number(rawPool.totalStats7d!.liquidityVolumeUsd),
    },
    total30dStats: {
      feesUsd: Number(rawPool.totalStats30d!.feesUsd),
      swapVolumeUsd: Number(rawPool.totalStats30d!.swapVolumeUsd),
      yield: Number(rawPool.totalStats30d!.yearlyYield),
      netInflowUsd: Number(rawPool.totalStats30d!.liquidityNetInflowUsd),
      liquidityVolumeUsd: Number(rawPool.totalStats30d!.liquidityVolumeUsd),
    },
    total90dStats: {
      feesUsd: Number(rawPool.totalStats90d!.feesUsd),
      swapVolumeUsd: Number(rawPool.totalStats90d!.swapVolumeUsd),
      yield: Number(rawPool.totalStats90d!.yearlyYield),
      netInflowUsd: Number(rawPool.totalStats90d!.liquidityNetInflowUsd),
      liquidityVolumeUsd: Number(rawPool.totalStats90d!.liquidityVolumeUsd),
    },
    poolType: rawPool.poolType,
    protocol: rawPool.protocol!,
    token0: {
      address: rawPool.token0!.tokenAddress,
      decimals: rawPool.token0!.decimals,
      name: rawPool.token0!.name,
      symbol: rawPool.token0!.symbol,
    },
    token1: {
      address: rawPool.token1!.tokenAddress,
      decimals: rawPool.token1!.decimals,
      name: rawPool.token1!.name,
      symbol: rawPool.token1!.symbol,
    },
    positionManagerAddress: rawPool.positionManager,
    initialFeeTier: rawPool.initialFeeTier,
    currentFeeTier: rawPool.currentFeeTier,
    isDynamicFee: rawPool.isDynamicFee,
  };
}

function _parseSpecificPoolTypeFromBasePool(
  basePool: IPool,
  rawPool: GetPoolsQuery_query_root_Pool_Pool,
): LiquidityPool {
  switch (rawPool.poolType) {
    case PoolType.V3: {
      const v3PoolDTO: IV3Pool = {
        ...basePool,
        latestSqrtPriceX96: rawPool.v3PoolData!.sqrtPriceX96,
        tickSpacing: rawPool.v3PoolData!.tickSpacing,
        latestTick: rawPool.v3PoolData!.tick,
      };

      return v3PoolDTO;
    }

    case PoolType.V4: {
      const v4PoolDTO: IV4Pool = {
        ...basePool,
        latestSqrtPriceX96: rawPool.v4PoolData!.sqrtPriceX96,
        tickSpacing: rawPool.v4PoolData!.tickSpacing,
        latestTick: rawPool.v4PoolData!.tick,
        permit2Address: rawPool.v4PoolData!.permit2,
        poolManagerAddress: rawPool.v4PoolData!.poolManager,
        stateViewAddress: rawPool.v4PoolData!.stateView ?? null,
        hook: rawPool.v4PoolData!.hooks !== ZERO_ETHEREUM_ADDRESS ? { address: rawPool.v4PoolData!.hooks } : null,
      };

      return v4PoolDTO;
    }

    case PoolType.ALGEBRA: {
      const algebraPoolDTO: IAlgebraPool = {
        ...basePool,
        latestSqrtPriceX96: rawPool.algebraPoolData!.sqrtPriceX96,
        tickSpacing: rawPool.algebraPoolData!.tickSpacing,
        latestTick: rawPool.algebraPoolData!.tick,
        communityFee: rawPool.algebraPoolData!.communityFee,
        deployer: rawPool.algebraPoolData!.deployer,
        plugin:
          rawPool.algebraPoolData!.plugin !== ZERO_ETHEREUM_ADDRESS
            ? {
                address: rawPool.algebraPoolData!.plugin,
                config: rawPool.algebraPoolData!.pluginConfig,
              }
            : null,
        version: rawPool.algebraPoolData!.version,
      };

      return algebraPoolDTO;
    }

    case PoolType.SLIPSTREAM: {
      const slipstreamPoolDTO: ISlipstreamPool = {
        ...basePool,
        latestSqrtPriceX96: rawPool.slipstreamPoolData!.sqrtPriceX96,
        tickSpacing: rawPool.slipstreamPoolData!.tickSpacing,
        latestTick: rawPool.slipstreamPoolData!.tick,
      };

      return slipstreamPoolDTO;
    }
  }
}
