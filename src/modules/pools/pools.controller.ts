import { LiquidityPool } from '@core/types';
import { ApiGetSinglePoolDocs } from '@lib/api/pool/decorators/get-pool-data-docs.decorator';
import { ApiSearchPoolsDocs } from '@lib/api/pool/decorators/search-pools-docs.decorator';
import { PoolOutputDTO } from '@lib/api/pool/dtos/output/pool-output.dto';
import { GetPoolDataParamsRequestDTO } from '@lib/api/pool/dtos/request/get-pool-data-params-request.dto';
import { SearchPoolsRequestDTO } from '@lib/api/pool/dtos/request/search-pools-request.dto';
import { SearchPoolsResponseDTO } from '@lib/api/pool/dtos/response/search-pools-response.dto';
import { POOL_OUTPUT_SUBTYPES } from '@lib/api/pool/pool_output_subtypes';
import { SearchPoolsCursor } from '@lib/api/pool/search-pools-cursor.dto';
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { PoolsService } from './pools.service';

@Controller('pools')
@ApiTags('Liquidity Pools')
@ApiExtraModels(PoolOutputDTO, SearchPoolsResponseDTO, ...POOL_OUTPUT_SUBTYPES)
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get('/:chainId/:poolAddress')
  @ApiGetSinglePoolDocs()
  async getPoolData(
    @Param()
    params: GetPoolDataParamsRequestDTO,
  ): Promise<LiquidityPool> {
    return await this.poolsService.getPool(params.poolAddress, params.chainId);
  }

  @Post('/search')
  @HttpCode(200)
  @ApiSearchPoolsDocs()
  async searchPools(@Body() requestBody: SearchPoolsRequestDTO): Promise<SearchPoolsResponseDTO> {
    const result = await this.poolsService.searchPools({
      tokensA: requestBody.tokensA,
      tokensB: requestBody.tokensB,
      searchFilters: requestBody.filters,
      searchConfig: requestBody.config,
    });

    return {
      pools: result.pools,
      filters: requestBody.filters,
      nextCursor: SearchPoolsCursor.encode(result.nextCursor),
    };
  }
}
