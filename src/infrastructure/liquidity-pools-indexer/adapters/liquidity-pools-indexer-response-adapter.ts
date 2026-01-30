import { TOKEN_LOGO, ZERO_ETHEREUM_ADDRESS } from '@core/constants';
import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { ILiquidityPool } from '@core/interfaces/liquidity-pool/liquidity-pool.interface';
import { IAlgebraLiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/algebra-liquidity-pool-metadata.interface';
import { ISlipstreamLiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/slipstream-liquidity-pool-metadata.interface';
import { IV3LiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/v3-liquidity-pool-metadata.interface';
import { IV4LiquidityPoolMetadata } from '@core/interfaces/liquidity-pool/metadata/v4-liquidity-pool-metadata.interface';
import { ILiquidityPoolsIndexerSingleChainToken } from '@core/interfaces/token/liquidity-pools-indexer-single-chain-token.interface';
import { ILiquidityPoolsIndexerTokenForMultichainAggregation } from '@core/interfaces/token/liquidity-pools-indexer-token-for-multichain-aggregation.interface';
import { IMultiChainTokenMetadata } from '@core/interfaces/token/multi-chain-token-metadata.interface';
import { ISingleChainTokenMetadata } from '@core/interfaces/token/single-chain-token-metadata.interface';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';
import { applyMultichainTokenOverrides } from '@core/token/multichain-token-overrides';
import { TokenUtils } from '@core/token/token-utils';
import { LiquidityPoolMetadata } from '@core/types/liquidity-pool-metadata';
import {
  LiquidityPoolsIndexerGetPoolsQuery_query_root_Pool_Pool,
  LiquidityPoolsIndexerGetSingleChainTokensQuery,
  LiquidityPoolsIndexerGetTokensForMultichainAggregationQuery,
} from '@gen/graphql.gen';

export const LiquidityPoolsIndexerResponseAdapter = {
  responseToTokenForMultichainList,
  responseToSingleChainTokenList,
  responseToLiquidityPoolList,
  liquidityPoolsIndexerTokensToMultichainTokenList,
};

function responseToTokenForMultichainList(
  response: LiquidityPoolsIndexerGetTokensForMultichainAggregationQuery,
): ILiquidityPoolsIndexerTokenForMultichainAggregation[] {
  return response.SingleChainToken.map((token) => ({
    id: token.id,
    address: token.tokenAddress,
    chainId: token.chainId,
    name: token.name,
    symbol: token.symbol,
    normalizedName: token.normalizedName,
    normalizedSymbol: token.normalizedSymbol,
    trackedTotalValuePooledUsd: Number(token.trackedTotalValuePooledUsd),
    trackedUsdPrice: Number(token.trackedUsdPrice),
  }));
}

function responseToSingleChainTokenList(
  response: LiquidityPoolsIndexerGetSingleChainTokensQuery,
): ILiquidityPoolsIndexerSingleChainToken[] {
  return response.SingleChainToken.map((token) => ({
    address: token.tokenAddress,
    chainId: token.chainId,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    logoUrl: TOKEN_LOGO(token.chainId, token.tokenAddress),
  }));
}

function responseToLiquidityPoolList(
  rawPools: LiquidityPoolsIndexerGetPoolsQuery_query_root_Pool_Pool[],
): ILiquidityPool[] {
  const matchedPools: ILiquidityPool[] = [];

  for (const pool of rawPools) {
    const parsedPool = _parseRawPool(pool);
    matchedPools.push(parsedPool);
  }

  return matchedPools;
}

function liquidityPoolsIndexerTokensToMultichainTokenList(
  liquidityPoolsIndexerTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[],
  params: {
    matchAllSymbols: boolean;
    order: ITokenOrder;
  },
): {
  multichainTokenList: IMultiChainTokenMetadata[];
  discardedTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[];
} {
  const heuristicResult = _groupTokensBySymbolAndPriceStrategy(liquidityPoolsIndexerTokens, params);

  return applyMultichainTokenOverrides(
    heuristicResult.multichainTokenList,
    heuristicResult.discardedTokens,
    liquidityPoolsIndexerTokens,
    params.order,
  );
}

function _groupTokensBySymbolAndPriceStrategy(
  liquidityPoolsIndexerTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[],
  params: {
    matchAllSymbols: boolean;
  },
): {
  multichainTokenList: IMultiChainTokenMetadata[];
  discardedTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[];
} {
  const symbolGroups = new Map<string, ILiquidityPoolsIndexerTokenForMultichainAggregation[]>();

  for (const token of liquidityPoolsIndexerTokens) {
    if (!symbolGroups.has(token.normalizedSymbol)) {
      symbolGroups.set(token.normalizedSymbol, []);
    }
    symbolGroups.get(token.normalizedSymbol)!.push(token);
  }

  const multichainTokenList: IMultiChainTokenMetadata[] = [];
  const discardedTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[] = [];
  const processedIds = new Set<string>();

  for (const [, tokens] of symbolGroups) {
    tokens.sort((a, b) => b.trackedTotalValuePooledUsd - a.trackedTotalValuePooledUsd);

    for (const anchor of tokens) {
      if (processedIds.has(anchor.id)) continue;

      const currentGroup: IMultiChainTokenMetadata = {
        addresses: [],
        chainIds: [],
        name: anchor.name,
        symbol: anchor.symbol,
        logoUrl: TOKEN_LOGO(anchor.chainId, anchor.address),
      };

      const seenChainIds = new Set<number>();

      for (const candidate of tokens) {
        if (processedIds.has(candidate.id)) continue;

        const priceDiff = Math.abs(candidate.trackedUsdPrice - anchor.trackedUsdPrice);
        const pricePercentageDiff = anchor.trackedUsdPrice === 0 ? 0 : priceDiff / anchor.trackedUsdPrice;

        const meetsMatchingCriteria = pricePercentageDiff <= 0.2 && TokenUtils.areTokensTheSame(candidate, anchor);
        const chainAlreadySeen = seenChainIds.has(candidate.chainId);

        if (meetsMatchingCriteria && (params.matchAllSymbols || !chainAlreadySeen)) {
          currentGroup.addresses.push({ chainId: candidate.chainId, address: candidate.address });
          currentGroup.chainIds.push(candidate.chainId);

          seenChainIds.add(candidate.chainId);
        } else {
          discardedTokens.push(candidate);
        }

        processedIds.add(candidate.id);
      }

      if (currentGroup.addresses.length > 0) {
        multichainTokenList.push(currentGroup);
      }
    }
  }

  return { multichainTokenList, discardedTokens };
}

function _parseRawPool(rawPool: LiquidityPoolsIndexerGetPoolsQuery_query_root_Pool_Pool): ILiquidityPool {
  const poolTokens = [rawPool.token0!, rawPool.token1!];

  const poolTokensMapped: ISingleChainTokenMetadata[] = poolTokens.map((token) => ({
    chainId: rawPool.chainId,
    address: token.tokenAddress,
    decimals: token.decimals,
    name: token.name,
    symbol: token.symbol,
    logoUrl: TOKEN_LOGO(rawPool.chainId, token.tokenAddress),
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

function _buildLiquidityPoolTypeMetadata(
  rawPool: LiquidityPoolsIndexerGetPoolsQuery_query_root_Pool_Pool,
): LiquidityPoolMetadata {
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
      throw new Error(`Unknown liquidity pool type from indexer: ${rawPool.poolType as string}`);
    }
  }
}
