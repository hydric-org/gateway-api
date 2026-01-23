import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { LiquidityPoolSearchConfig } from '@lib/api/liquidity-pool/dtos/liquiditity-pool-search-config.dto';
import { LiquidityPool } from '@lib/api/liquidity-pool/dtos/liquidity-pool.dto';
import { SearchLiquidityPoolsCursor } from '@lib/api/liquidity-pool/search-liquidity-pools-cursor.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PoolsService {
  constructor(private readonly liqudityPoolsIndexerClient: LiquidityPoolsIndexerClient) {}

  async getPool(poolAddress: string, chainId: number): Promise<LiquidityPool> {
    return await this.liqudityPoolsIndexerClient.getPool(poolAddress, chainId);
  }

  async searchPools(params: {
    tokensA: BlockchainAddress[];
    tokensB: BlockchainAddress[];
    searchFilters: ILiquidityPoolFilter;
    searchConfig: LiquidityPoolSearchConfig;
  }): Promise<{ pools: LiquidityPool[]; nextCursor: string | null }> {
    const passedCursor = SearchLiquidityPoolsCursor.decode(params.searchConfig.cursor);

    const pools = await this.liqudityPoolsIndexerClient.getPools({
      tokensA: params.tokensA,
      tokensB: params.tokensB,
      filters: params.searchFilters,
      limit: params.searchConfig.limit,
      skip: passedCursor.skip,
      orderBy: params.searchConfig.orderBy,
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
}
