import { IPoolFilter } from '@core/interfaces/pool/pool-filter.interface';
import { PoolsIndexerClient } from '@infrastructure/indexer/clients/pools-indexer-client';
import { PoolSearchConfigInputDTO } from '@lib/api/pool/dtos/input/pool-search-config-input.dto';
import { SearchPoolsCursor } from '@lib/api/pool/search-pools-cursor.dto';
import { Injectable } from '@nestjs/common';
import { LiquidityPool } from 'src/core/types';

@Injectable()
export class PoolsService {
  constructor(private readonly poolsIndexerClient: PoolsIndexerClient) {}

  async getPool(poolAddress: string, chainId: number): Promise<LiquidityPool> {
    return await this.poolsIndexerClient.getPool(poolAddress, chainId);
  }

  async searchPools(params: {
    tokensA: string[];
    tokensB: string[];
    searchFilters: IPoolFilter;
    searchConfig: PoolSearchConfigInputDTO;
  }): Promise<{ pools: LiquidityPool[]; nextCursor: SearchPoolsCursor }> {
    const passedCursor = SearchPoolsCursor.decode(params.searchConfig.cursor);
    const nextCursor: SearchPoolsCursor = { ...passedCursor, skip: passedCursor.skip + params.searchConfig.limit };

    const pools = await this.poolsIndexerClient.getPools({
      tokensA: params.tokensA,
      tokensB: params.tokensB,
      filters: params.searchFilters,
      limit: params.searchConfig.limit,
      skip: passedCursor.skip,
      orderBy: params.searchConfig.orderBy,
    });

    return {
      pools: pools,
      nextCursor: nextCursor,
    };
  }
}
