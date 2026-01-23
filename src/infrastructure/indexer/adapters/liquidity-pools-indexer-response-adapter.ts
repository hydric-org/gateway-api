import { ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { ILiquidityPool } from '@core/interfaces/liquidity-pool/liquidity-pool.interface';
import { IAlgebraLiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/algebra-liquidity-pool-metadata.interface';
import { ISlipstreamLiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/slipstream-liquidity-pool-metadata.interface';
import { IV3LiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/v3-liquidity-pool-metadata.interface';
import { IV4LiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/v4-liquidity-pool-metadata.interface';
import { IIndexerToken } from '@core/interfaces/token/indexer-token.interface';
import { IMultiChainToken } from '@core/interfaces/token/multi-chain-token.interface';
import { TokenUtils } from '@core/token/token-utils';
import { LiquidityPoolMetadata } from '@core/types/liquidity-pool-metadata';
import {
  GetPoolsQuery_query_root_Pool_Pool,
  GetTokensQuery_query_root_SingleChainToken_SingleChainToken,
} from '@gen/graphql.gen';

export const LiquidityPoolsIndexerResponseAdapter = {
  responseToLiquidityPoolList,
  responseToIndexerTokenList,
  indexerTokensToMultichainTokenList,
};

function responseToIndexerTokenList(
  rawTokens: GetTokensQuery_query_root_SingleChainToken_SingleChainToken[],
): IIndexerToken[] {
  return rawTokens.map(
    (token): IIndexerToken => ({
      id: token.id,
      normalizedName: token.normalizedName,
      normalizedSymbol: token.normalizedSymbol,
      address: token.tokenAddress,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      chainId: token.chainId,
      trackedUsdPrice: Number(token.trackedUsdPrice),
      trackedTotalValuePooledUsd: Number(token.trackedTotalValuePooledUsd),
    }),
  );
}

function responseToLiquidityPoolList(rawPools: GetPoolsQuery_query_root_Pool_Pool[]): ILiquidityPool[] {
  const matchedPools: ILiquidityPool[] = [];

  for (const pool of rawPools) {
    const parsedPool = _parseRawPool(pool);
    matchedPools.push(parsedPool);
  }

  return matchedPools;
}

function indexerTokensToMultichainTokenList(indexerTokens: IIndexerToken[]): {
  multichainTokenList: IMultiChainToken[];
  discardedTokens: IIndexerToken[];
} {
  const groups = new Map<string, IIndexerToken[]>();

  for (const token of indexerTokens) {
    if (!groups.has(token.normalizedSymbol)) {
      groups.set(token.normalizedSymbol, []);
    }

    groups.get(token.normalizedSymbol)!.push(token);
  }

  const multichainTokenList: IMultiChainToken[] = [];
  const processedIds = new Set<string>();
  const discardedTokens: IIndexerToken[] = [];

  for (const [_, tokens] of groups) {
    tokens.sort((a, b) => b.trackedTotalValuePooledUsd - a.trackedTotalValuePooledUsd);

    for (const anchor of tokens) {
      if (processedIds.has(anchor.id)) continue;

      const addresses: string[] = [];
      const chainIds: number[] = [];
      const ids: string[] = [];
      const decimals: Record<string, number> = {};

      for (const candidate of tokens) {
        if (processedIds.has(candidate.id)) continue;

        const priceDiff = Math.abs(candidate.trackedUsdPrice - anchor.trackedUsdPrice);
        const pricePercentageDiff = anchor.trackedUsdPrice === 0 ? 0 : priceDiff / anchor.trackedUsdPrice;

        if (pricePercentageDiff <= 0.2 && TokenUtils.areTokensTheSame(candidate, anchor)) {
          addresses.push(candidate.address);
          chainIds.push(candidate.chainId);
          ids.push(candidate.id);
          decimals[candidate.address] = candidate.decimals;
        } else {
          discardedTokens.push(candidate);
        }

        // Mark ALL candidates as processed (matched or not) to prevent duplicates
        processedIds.add(candidate.id);
      }

      if (ids.length > 0) {
        multichainTokenList.push({
          addresses,
          chainIds,
          ids,
          decimals,
          name: anchor.name,
          symbol: anchor.symbol,
        });
      }
    }
  }

  return { multichainTokenList, discardedTokens };
}

function _parseRawPool(rawPool: GetPoolsQuery_query_root_Pool_Pool): ILiquidityPool {
  const poolTokens = [rawPool.token0!, rawPool.token1!];

  const poolTokensMapped = poolTokens.map((token) => ({
    address: token.tokenAddress,
    decimals: token.decimals,
    name: token.name,
    symbol: token.symbol,
  }));

  return {
    chainId: rawPool.chainId,
    address: rawPool.poolAddress,
    createdAtTimestamp: Number(rawPool.createdAtTimestamp),
    feeTier: {
      feeTierPercentage: Number(rawPool.currentFeeTierPercentage),
      isDynamic: rawPool.isDynamicFee,
    },
    tokens: poolTokensMapped,
    protocol: {
      id: rawPool.protocol!.id,
      logoUrl: rawPool.protocol!.logo,
      name: rawPool.protocol!.name,
      url: rawPool.protocol!.url,
    },
    type: rawPool.poolType,
    stats: {
      stats24h: {
        feesUsd: Number(rawPool.totalStats24h!.feesUsd),
        swapVolumeUsd: Number(rawPool.totalStats24h!.swapVolumeUsd),
        yield: Number(rawPool.totalStats24h!.yearlyYield),
        netInflowUsd: Number(rawPool.totalStats24h!.liquidityNetInflowUsd),
        liquidityVolumeUsd: Number(rawPool.totalStats24h!.liquidityVolumeUsd),
      },
      stats7d: {
        feesUsd: Number(rawPool.totalStats7d!.feesUsd),
        swapVolumeUsd: Number(rawPool.totalStats7d!.swapVolumeUsd),
        yield: Number(rawPool.totalStats7d!.yearlyYield),
        netInflowUsd: Number(rawPool.totalStats7d!.liquidityNetInflowUsd),
        liquidityVolumeUsd: Number(rawPool.totalStats7d!.liquidityVolumeUsd),
      },
      stats30d: {
        feesUsd: Number(rawPool.totalStats30d!.feesUsd),
        swapVolumeUsd: Number(rawPool.totalStats30d!.swapVolumeUsd),
        yield: Number(rawPool.totalStats30d!.yearlyYield),
        netInflowUsd: Number(rawPool.totalStats30d!.liquidityNetInflowUsd),
        liquidityVolumeUsd: Number(rawPool.totalStats30d!.liquidityVolumeUsd),
      },
      stats90d: {
        feesUsd: Number(rawPool.totalStats90d!.feesUsd),
        swapVolumeUsd: Number(rawPool.totalStats90d!.swapVolumeUsd),
        yield: Number(rawPool.totalStats90d!.yearlyYield),
        netInflowUsd: Number(rawPool.totalStats90d!.liquidityNetInflowUsd),
        liquidityVolumeUsd: Number(rawPool.totalStats90d!.liquidityVolumeUsd),
      },
    },
    balance: {
      totalValueLockedUsd: Number(rawPool.totalValueLockedUsd),
      tokens: [
        {
          amount: Number(rawPool.totalValueLockedToken0),
          amountUsd: Number(rawPool.totalValueLockedToken0Usd),
          token: poolTokensMapped[0],
        },
        {
          amount: Number(rawPool.totalValueLockedToken1),
          amountUsd: Number(rawPool.totalValueLockedToken1Usd),
          token: poolTokensMapped[1],
        },
      ],
    },
    metadata: _buildLiquidityPoolTypeMetadata(rawPool),
  };
}

function _buildLiquidityPoolTypeMetadata(rawPool: GetPoolsQuery_query_root_Pool_Pool): LiquidityPoolMetadata {
  switch (rawPool.poolType) {
    case LiquidityPoolType.V3: {
      const v3LiquidityPoolMetadata: IV3LiquidityPoolMetadata = {
        latestSqrtPriceX96: rawPool.v3PoolData!.sqrtPriceX96,
        tickSpacing: rawPool.v3PoolData!.tickSpacing,
        latestTick: rawPool.v3PoolData!.tick,
        positionManagerAddress: rawPool.positionManager,
      };

      return v3LiquidityPoolMetadata;
    }

    case LiquidityPoolType.V4: {
      const v4LiquidityPoolMetadata: IV4LiquidityPoolMetadata = {
        latestSqrtPriceX96: rawPool.v4PoolData!.sqrtPriceX96,
        tickSpacing: rawPool.v4PoolData!.tickSpacing,
        latestTick: rawPool.v4PoolData!.tick,
        permit2Address: rawPool.v4PoolData!.permit2,
        poolManagerAddress: rawPool.v4PoolData!.poolManager,
        stateViewAddress: rawPool.v4PoolData!.stateView ?? null,
        hook: rawPool.v4PoolData!.hooks !== ZERO_ETHEREUM_ADDRESS ? { address: rawPool.v4PoolData!.hooks } : null,
        positionManagerAddress: rawPool.positionManager,
      };

      return v4LiquidityPoolMetadata;
    }

    case LiquidityPoolType.ALGEBRA: {
      const algebraLiquidityPoolMetadata: IAlgebraLiquidityPoolMetadata = {
        positionManagerAddress: rawPool.positionManager,
        latestSqrtPriceX96: rawPool.algebraPoolData!.sqrtPriceX96,
        tickSpacing: rawPool.algebraPoolData!.tickSpacing,
        latestTick: rawPool.algebraPoolData!.tick,
        communityFeePercentage: rawPool.algebraPoolData!.communityFeePercentage,
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

      return algebraLiquidityPoolMetadata;
    }

    case LiquidityPoolType.SLIPSTREAM: {
      const slipstreamLiquidityPoolMetadata: ISlipstreamLiquidityPoolMetadata = {
        latestSqrtPriceX96: rawPool.slipstreamPoolData!.sqrtPriceX96,
        tickSpacing: rawPool.slipstreamPoolData!.tickSpacing,
        latestTick: rawPool.slipstreamPoolData!.tick,
        positionManagerAddress: rawPool.positionManager,
      };

      return slipstreamLiquidityPoolMetadata;
    }

    default: {
      throw new Error(`Unknown liquidity pool type: ${rawPool.poolType} cannot be parsed`);
    }
  }
}
