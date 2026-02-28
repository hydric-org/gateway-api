import { IBlockchainBasket } from '@core/interfaces/blockchain-basket.interface';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { TokenBasketsClient } from '@infrastructure/baskets/clients/token-baskets.client';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { LiquidityPoolSearchConfig } from '@lib/api/liquidity-pool/dtos/liquiditity-pool-search-config.dto';
import { LiquidityPool } from '@lib/api/liquidity-pool/dtos/liquidity-pool.dto';
import { SearchLiquidityPoolsCursor } from '@lib/api/liquidity-pool/search-liquidity-pools-cursor.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PoolsService {
  constructor(
    private readonly liqudityPoolsIndexerClient: LiquidityPoolsIndexerClient,
    private readonly tokenBasketsClient: TokenBasketsClient,
  ) {}

  async getPool(poolAddress: string, chainId: number): Promise<LiquidityPool> {
    return await this.liqudityPoolsIndexerClient.getPool(poolAddress, chainId);
  }

  async searchPools(params: {
    tokensA: BlockchainAddress[];
    tokensB: BlockchainAddress[];
    basketsA: IBlockchainBasket[];
    basketsB: IBlockchainBasket[];
    searchFilters: ILiquidityPoolFilter;
    searchConfig: LiquidityPoolSearchConfig;
  }): Promise<{ pools: LiquidityPool[]; nextCursor: string | null }> {
    const passedCursor = SearchLiquidityPoolsCursor.decode(params.searchConfig.cursor);

    const isSideAInputed = params.tokensA.length > 0 || params.basketsA.length > 0;
    const isSideBInputed = params.tokensB.length > 0 || params.basketsB.length > 0;

    const { basketAAddresses, basketBAddresses } = await this._resolveBasketsFromInput(
      params.basketsA,
      params.basketsB,
    );

    const tokensAWithBaskets = [...params.tokensA, ...basketAAddresses];
    const tokensBWithBaskets = [...params.tokensB, ...basketBAddresses];

    if (isSideAInputed && tokensAWithBaskets.length === 0) return { pools: [], nextCursor: null };
    if (isSideBInputed && tokensBWithBaskets.length === 0) return { pools: [], nextCursor: null };

    const pools = await this.liqudityPoolsIndexerClient.getPools({
      tokensA: tokensAWithBaskets,
      tokensB: tokensBWithBaskets,
      filters: params.searchFilters,
      limit: params.searchConfig.limit,
      skip: passedCursor.skip,
      orderBy: params.searchConfig.orderBy,
      parseWrappedToNative: params.searchConfig.parseWrappedToNative,
      useWrappedForNative: params.searchConfig.useWrappedForNative,
    });

    const nextCursor: string | null =
      pools.length < params.searchConfig.limit
        ? null
        : SearchLiquidityPoolsCursor.encode({
            ...passedCursor,
            skip: passedCursor.skip + params.searchConfig.limit,
          });

    return {
      pools: pools,
      nextCursor: nextCursor,
    };
  }

  private async _resolveBasketsFromInput(
    basketsA: IBlockchainBasket[],
    basketsB: IBlockchainBasket[],
  ): Promise<{ basketAAddresses: BlockchainAddress[]; basketBAddresses: BlockchainAddress[] }> {
    const allBasketIds = Array.from(new Set([...basketsA.map((b) => b.basketId), ...basketsB.map((b) => b.basketId)]));

    const configurations =
      allBasketIds.length > 0 ? await this.tokenBasketsClient.getBaskets(undefined, allBasketIds) : [];

    const resolve = (baskets: IBlockchainBasket[]): BlockchainAddress[] => {
      const addresses: BlockchainAddress[] = [];
      for (const basket of baskets) {
        const config = configurations.find((c) => c.id === basket.basketId);
        if (!config) continue;

        const chainIdSet = new Set((basket.chainIds || []).map(Number));
        const filtered = config.addresses.filter((a) => chainIdSet.size === 0 || chainIdSet.has(Number(a.chainId)));
        addresses.push(...filtered.map((a) => new BlockchainAddress(a.chainId, a.address)));
      }
      return addresses;
    };

    return {
      basketAAddresses: resolve(basketsA),
      basketBAddresses: resolve(basketsB),
    };
  }
}
