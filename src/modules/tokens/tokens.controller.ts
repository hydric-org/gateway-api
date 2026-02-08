import { ApiGetMultiChainTokenListDocs } from '@lib/api/token/decorators/get-multichain-token-list-docs.decorator';
import { ApiGetSingleChainTokenDocs } from '@lib/api/token/decorators/get-single-chain-token-docs.decorator';
import { ApiGetSingleChainTokenListDocs } from '@lib/api/token/decorators/get-single-chain-token-list-docs.decorator';
import { ApiSearchMultichainTokensDocs } from '@lib/api/token/decorators/search-multichain-tokens-docs.decorator';
import { ApiSearchSingleChainTokensDocs } from '@lib/api/token/decorators/search-single-chain-tokens-docs.decorator';
import { ApiSearchTokensByAddressDocs } from '@lib/api/token/decorators/search-tokens-by-address-docs.decorator';
import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMultiChainTokenListRequestParams } from '../../lib/api/token/dtos/request/get-multi-chain-token-list-request-params.dto';
import { GetSingleChainTokenListPathParams } from '../../lib/api/token/dtos/request/get-single-chain-token-list-path-params.dto';
import { GetSingleChainTokenListRequestBody } from '../../lib/api/token/dtos/request/get-single-chain-token-list-request-body.dto';
import { GetSingleChainTokenPathParams } from '../../lib/api/token/dtos/request/get-single-chain-token-path-params.dto';
import { SearchMultichainTokensRequestParams } from '../../lib/api/token/dtos/request/search-multichain-tokens-request-params.dto';
import { SearchSingleChainTokensRequestBody } from '../../lib/api/token/dtos/request/search-single-chain-tokens-request-body.dto';
import { SearchTokensByAddressPathParams } from '../../lib/api/token/dtos/request/search-tokens-by-address-path-params.dto';
import { GetMultiChainTokenListResponse } from '../../lib/api/token/dtos/response/get-multi-chain-token-list-response.dto';
import { GetSingleChainTokenListResponse } from '../../lib/api/token/dtos/response/get-single-chain-token-list-response.dto';
import { GetSingleChainTokenResponse } from '../../lib/api/token/dtos/response/get-single-chain-token-response.dto';
import { SearchMultichainTokensResponse } from '../../lib/api/token/dtos/response/search-multichain-tokens-response.dto';
import { SearchSingleChainTokensResponse } from '../../lib/api/token/dtos/response/search-single-chain-tokens-response.dto';
import { SearchTokensByAddressResponse } from '../../lib/api/token/dtos/response/search-tokens-by-address-response.dto';
import { ParseChainIdArrayPipe } from '../../lib/api/token/pipes/parse-chain-id-array.pipe';
import { TokensService } from './tokens.service';

@Controller('tokens')
@ApiTags('Tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @HttpCode(200)
  @Post()
  @ApiGetMultiChainTokenListDocs()
  async getMultiChainTokenList(
    @Body()
    body: GetMultiChainTokenListRequestParams,
  ): Promise<GetMultiChainTokenListResponse> {
    const result = await this.tokensService.getMultichainTokenList(body.config, body.filters);
    return new GetMultiChainTokenListResponse(result.tokens, result.nextCursor);
  }

  @HttpCode(200)
  @Post('/search')
  @ApiSearchMultichainTokensDocs()
  async searchMultichainTokens(
    @Body()
    body: SearchMultichainTokensRequestParams,
  ): Promise<SearchMultichainTokensResponse> {
    const result = await this.tokensService.searchMultichainTokens(body.search, body.config, body.filters);

    return new SearchMultichainTokensResponse(result.tokens, body.filters, result.nextCursor);
  }

  @Get('/:tokenAddress')
  @ApiSearchTokensByAddressDocs()
  async searchTokensByAddress(
    @Param() params: SearchTokensByAddressPathParams,
    @Query('chainIds', ParseChainIdArrayPipe) chainIds?: number[],
  ): Promise<SearchTokensByAddressResponse> {
    const tokens = await this.tokensService.searchTokensByAddress(params.tokenAddress, chainIds);

    return new SearchTokensByAddressResponse(tokens);
  }

  @Get('/:chainId/:tokenAddress')
  @ApiGetSingleChainTokenDocs()
  async getSingleChainToken(@Param() params: GetSingleChainTokenPathParams): Promise<GetSingleChainTokenResponse> {
    const token = await this.tokensService.getSingleChainTokenInfo(params.chainId, params.tokenAddress);
    return new GetSingleChainTokenResponse(token);
  }

  @HttpCode(200)
  @Post('/:chainId')
  @ApiGetSingleChainTokenListDocs()
  async getSingleChainTokenList(
    @Param() params: GetSingleChainTokenListPathParams,
    @Body() body: GetSingleChainTokenListRequestBody,
  ): Promise<GetSingleChainTokenListResponse> {
    const result = await this.tokensService.getSingleChainTokenList(params.chainId, body.config, body.filters);
    return new GetSingleChainTokenListResponse(result.tokens, result.nextCursor);
  }

  @HttpCode(200)
  @Post('/:chainId/search')
  @ApiSearchSingleChainTokensDocs()
  async searchSingleChainTokens(
    @Param() params: GetSingleChainTokenListPathParams,
    @Body() body: SearchSingleChainTokensRequestBody,
  ): Promise<SearchSingleChainTokensResponse> {
    const result = await this.tokensService.searchSingleChainTokens(
      params.chainId,
      body.search,
      body.config,
      body.filters,
    );

    return new SearchSingleChainTokensResponse(result.tokens, body.filters, result.nextCursor);
  }
}
