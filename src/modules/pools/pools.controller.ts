import { Body, Controller, DefaultValuePipe, Get, HttpCode, Param, ParseBoolPipe, Post, Query } from '@nestjs/common';
import { PoolSearchConfigDTO } from 'src/core/dtos/pool-search-config.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { PoolDTO } from 'src/core/dtos/pool.dto';
import { PoolsSearchResultDTO } from 'src/core/dtos/pools-search-result.dto';
import { ParseAddressPipe, ParseOptionalAddressPipe } from 'src/core/pipes/address.pipe';
import { ParseChainIdPipe } from 'src/core/pipes/chain-id.pipe';
import { tokenGroupList } from 'src/core/token-group-list';
import { LiquidityPool } from 'src/core/types';
import { PoolsService } from './pools.service';

@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}
  @Get(':poolAddress/:chainId')
  async getPoolData(
    @Param('poolAddress', ParseAddressPipe)
    poolAddress: string,
    @Param('chainId', ParseChainIdPipe)
    chainId: number,
    @Query(
      'parseWrappedToNative',
      new DefaultValuePipe(true),
      new ParseBoolPipe({
        exceptionFactory: () => new Error('parseWrappedToNative must be a boolean'),
      }),
    )
    parseWrappedToNative: boolean,
  ): Promise<PoolDTO> {
    return await this.poolsService.getPoolData(poolAddress, chainId, parseWrappedToNative);
  }

  @Post('/search/all')
  @HttpCode(200)
  async searchPoolsAcrossNetworks(
    @Query('token0Id')
    token0Id: string,
    @Query('token1Id')
    token1Id: string,
    @Query('group0Id')
    group0Id: string,
    @Query('group1Id')
    group1Id: string,
    @Body('filters')
    filters: PoolSearchFiltersDTO,
    @Body('config')
    config: PoolSearchConfigDTO,
  ): Promise<PoolsSearchResultDTO> {
    const tokens0: string[] = [...(token0Id ? [token0Id] : [])];
    const tokens1: string[] = [...(token1Id ? [token1Id] : [])];

    if (group0Id) tokens0.push(...this._resolveTokensFromGroupIds(group0Id));
    if (group1Id) tokens1.push(...this._resolveTokensFromGroupIds(group1Id));

    const pools = await this.poolsService.searchPoolsCrossChain({
      token0Ids: tokens0,
      token1Ids: tokens1,
      searchFilters: filters,
      searchConfig: config,
    });

    return {
      pools,
      filters,
    };
  }

  @Post('/search/:chainId')
  @HttpCode(200)
  async searchPoolsInChain(
    @Param('chainId', ParseChainIdPipe)
    chainId: number,
    @Query('token0Address', ParseOptionalAddressPipe)
    token0Address: string,
    @Query('token1Address', ParseOptionalAddressPipe)
    token1Address: string,
    @Query('group0Id')
    group0Id: string,
    @Query('group1Id')
    group1Id: string,
    @Body('filters')
    filters: PoolSearchFiltersDTO = new PoolSearchFiltersDTO(),
    @Body('config')
    config: PoolSearchConfigDTO = new PoolSearchConfigDTO(),
  ): Promise<PoolsSearchResultDTO> {
    const tokens0: string[] = [...(token0Address ? [token0Address] : [])];
    const tokens1: string[] = [...(token1Address ? [token1Address] : [])];

    if (group0Id) tokens0.push(...this._resolveTokensFromGroupIds(group0Id, chainId));
    if (group1Id) tokens1.push(...this._resolveTokensFromGroupIds(group1Id, chainId));

    const pools: LiquidityPool[] = await this.poolsService.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      searchFilters: filters,
      searchConfig: config,
    });

    return {
      pools,
      filters,
    };
  }

  private _resolveTokensFromGroupIds(groupId: string, chainId?: number): string[] {
    const tokens: string[] = [];
    const groupTokens = tokenGroupList.find((group) => group.id === groupId)?.tokens;

    groupTokens?.forEach((token) => {
      if (!chainId) return tokens.push(token.id);

      const tokenAddressInNetwork = token.addresses[chainId];

      if (typeof tokenAddressInNetwork === 'string') {
        return tokens.push(tokenAddressInNetwork);
      }
    });

    return tokens;
  }
}
