import { GetSingleLiquidityPoolDocs } from '@lib/api/liquidity-pool/decorators/get-single-liquidity-pool-docs.decorator';
import { SearchLiquidityPoolsDocs } from '@lib/api/liquidity-pool/decorators/search-liquidity-pools-docs.decorator';
import { GetSingleLiquidityPoolRequestParams } from '@lib/api/liquidity-pool/dtos/request-params/get-single-liquidity-pool-request-params.dto';
import { SearchLiquidityPoolsRequestParams } from '@lib/api/liquidity-pool/dtos/request-params/search-liquidity-pools-request-params.dto';
import { GetSingleLiquidityPoolResponse } from '@lib/api/liquidity-pool/dtos/response/get-single-liquidity-pool-response.dto';
import { SearchLiquidityPoolsResponse } from '@lib/api/liquidity-pool/dtos/response/search-liquidity-pools-response.dto';
import { LIQUIDITY_POOL_METADATA_TYPES } from '@lib/api/liquidity-pool/liquidity-pool-metadata-types';
import { SearchLiquidityPoolsCursor } from '@lib/api/liquidity-pool/search-liquidity-pools-cursor.dto';
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { PoolsService } from './pools.service';

@Controller('pools')
@ApiTags('Liquidity Pools')
@ApiExtraModels(...LIQUIDITY_POOL_METADATA_TYPES)
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get('/:chainId/:poolAddress')
  @GetSingleLiquidityPoolDocs()
  async getPoolData(
    @Param()
    params: GetSingleLiquidityPoolRequestParams,
  ): Promise<GetSingleLiquidityPoolResponse> {
    const pool = await this.poolsService.getPool(params.poolAddress, params.chainId);
    return { pool };
  }

  @Post('/search')
  @HttpCode(200)
  @SearchLiquidityPoolsDocs()
  async searchPools(@Body() requestBody: SearchLiquidityPoolsRequestParams): Promise<SearchLiquidityPoolsResponse> {
    const result = await this.poolsService.searchPools({
      tokensA: requestBody.tokensA,
      tokensB: requestBody.tokensB,
      searchFilters: requestBody.filters,
      searchConfig: requestBody.config,
    });

    return {
      pools: result.pools,
      filters: requestBody.filters,
      nextCursor: SearchLiquidityPoolsCursor.encode(result.nextCursor),
    };
  }
}
