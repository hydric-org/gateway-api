import { TOKEN_LOGO } from '@core/constants';
import { ILiquidityPoolsIndexerTokenForMultichainAggregation } from '@core/interfaces/token/liquidity-pools-indexer-token-for-multichain-aggregation.interface';
import { IMultiChainTokenMetadata } from '@core/interfaces/token/multi-chain-token-metadata.interface';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';
import { TokenUtils } from './token-utils';

/**
 * A map of Token ID ({chainId}-{address}) to its override configuration.
 * This map has the highest priority effectively overriding any automated decision.
 */
export const MULTICHAIN_TOKEN_OVERRIDES: Record<string, { partOf: string[] | null }> = {
  '5000-0xab575258d37EaA5C8956EfABe71F4eE8F6397cF3': { partOf: ['5000-0xab575258d37EaA5C8956EfABe71F4eE8F6397cF3'] },
  '8453-0x236aa50979d5f3de3bd1eeb40e81137f22ab794b': { partOf: ['1-0x18084fba666a33d37592fa2633fd49a74dd93a88'] },
};

/**
 * Internal cluster representation for token grouping.
 */
interface _ITokenCluster {
  ids: Set<string>;
  isActive: boolean;
}

/**
 * Applies overrides by converting groups to clusters, manipulating them via Union-Find operations,
 * and reconstructing the list.
 */
export function applyMultichainTokenOverrides(
  existingGroups: IMultiChainTokenMetadata[],
  existingDiscarded: ILiquidityPoolsIndexerTokenForMultichainAggregation[],
  allTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[],
  order: ITokenOrder,
): {
  multichainTokenList: IMultiChainTokenMetadata[];
  discardedTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[];
} {
  const clusters: _ITokenCluster[] = [];
  const idToCluster = new Map<string, _ITokenCluster>();
  const idToTokenMap = new Map<string, ILiquidityPoolsIndexerTokenForMultichainAggregation>();

  for (const token of allTokens) {
    idToTokenMap.set(token.id, token);
  }

  for (const group of existingGroups) {
    const ids = group.addresses.map((a) => `${a.chainId}-${a.address}`);
    const cluster: _ITokenCluster = { ids: new Set(ids), isActive: true };
    clusters.push(cluster);
    for (const id of ids) {
      idToCluster.set(id, cluster);
    }
  }

  for (const token of existingDiscarded) {
    const cluster: _ITokenCluster = { ids: new Set([token.id]), isActive: false };
    clusters.push(cluster);
    idToCluster.set(token.id, cluster);
  }

  const overrideTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[] = [];
  const explicitExclusions = new Set<string>();

  for (const token of allTokens) {
    const override = MULTICHAIN_TOKEN_OVERRIDES[token.id];
    if (!override) continue;

    if (override.partOf === null) {
      explicitExclusions.add(token.id);
      _removeTokenFromCluster(token.id, idToCluster);
      continue;
    }

    if (override.partOf && override.partOf.length >= 0) {
      overrideTokens.push(token);
      _removeTokenFromCluster(token.id, idToCluster);

      const newCluster: _ITokenCluster = { ids: new Set([token.id]), isActive: true };
      clusters.push(newCluster);
      idToCluster.set(token.id, newCluster);
    }
  }

  for (const token of overrideTokens) {
    const override = MULTICHAIN_TOKEN_OVERRIDES[token.id];
    if (!override || !override.partOf) continue;

    const currentCluster = idToCluster.get(token.id);
    if (!currentCluster) continue;

    for (const targetId of override.partOf) {
      if (targetId === token.id) continue;
      if (explicitExclusions.has(targetId)) continue;

      const targetCluster = idToCluster.get(targetId);
      if (targetCluster && targetCluster !== currentCluster) {
        _mergeTokenClusters(currentCluster, targetCluster, idToCluster);
      }
    }
  }

  const finalMultichainListWithTvl: (IMultiChainTokenMetadata & { totalValuePooledUsd: number })[] = [];
  const finalDiscardedList: ILiquidityPoolsIndexerTokenForMultichainAggregation[] = [];

  for (const cluster of clusters) {
    if (cluster.ids.size === 0) continue;

    if (cluster.isActive) {
      const groupTokens = _resolveClusterIdsToTokens(cluster.ids, idToTokenMap);
      if (groupTokens.length > 0) finalMultichainListWithTvl.push(_convertClusterToMultichainToken(groupTokens));
    } else {
      for (const id of cluster.ids) {
        const t = idToTokenMap.get(id);
        if (t && !explicitExclusions.has(t.id)) {
          finalDiscardedList.push(t);
        }
      }
    }
  }

  for (const id of explicitExclusions) {
    const t = idToTokenMap.get(id);
    if (t) finalDiscardedList.push(t);
  }

  if (order) TokenUtils.sortTokenList(finalMultichainListWithTvl, order);

  return {
    multichainTokenList: finalMultichainListWithTvl.map((t) => ({
      addresses: t.addresses,
      chainIds: t.chainIds,
      symbol: t.symbol,
      name: t.name,
      logoUrl: t.logoUrl,
    })),

    discardedTokens: finalDiscardedList,
  };
}

function _removeTokenFromCluster(tokenId: string, idToCluster: Map<string, _ITokenCluster>): void {
  const cluster = idToCluster.get(tokenId);
  if (cluster) {
    cluster.ids.delete(tokenId);
    idToCluster.delete(tokenId);
  }
}

function _mergeTokenClusters(
  current: _ITokenCluster,
  target: _ITokenCluster,
  idToCluster: Map<string, _ITokenCluster>,
): void {
  for (const id of target.ids) {
    current.ids.add(id);
    idToCluster.set(id, current);
  }
  target.ids.clear();
  target.isActive = false;
}

function _resolveClusterIdsToTokens(
  ids: Set<string>,
  map: Map<string, ILiquidityPoolsIndexerTokenForMultichainAggregation>,
): ILiquidityPoolsIndexerTokenForMultichainAggregation[] {
  const tokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[] = [];
  for (const id of ids) {
    const t = map.get(id);
    if (t) tokens.push(t);
  }
  return tokens;
}

function _convertClusterToMultichainToken(
  groupTokens: ILiquidityPoolsIndexerTokenForMultichainAggregation[],
): IMultiChainTokenMetadata & { totalValuePooledUsd: number } {
  groupTokens.sort((a, b) => b.trackedTotalValuePooledUsd - a.trackedTotalValuePooledUsd);
  const anchor = groupTokens[0];

  const totalValuePooledUsd = TokenUtils.sumTotalValuePooledUsd(groupTokens);

  return {
    addresses: groupTokens.map((t) => ({
      chainId: t.chainId,
      address: t.address,
    })),
    chainIds: groupTokens.map((t) => t.chainId),
    name: anchor.name,
    symbol: anchor.symbol,
    logoUrl: TOKEN_LOGO(anchor.chainId, anchor.address),
    totalValuePooledUsd,
  };
}
