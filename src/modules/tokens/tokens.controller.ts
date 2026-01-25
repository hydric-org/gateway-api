import { ApiGetMultiChainTokenListDocs } from '@lib/api/token/descorators/get-multichain-token-list-docs.decorator';
import { ApiGetSingleChainTokenListDocs } from '@lib/api/token/descorators/get-single-chain-token-list-docs.decorator';
import { ApiGetTokenByAddressDocs } from '@lib/api/token/descorators/get-token-by-address-docs.decorator';
import { ApiSearchMultichainTokensDocs } from '@lib/api/token/descorators/search-multichain-tokens-docs.decorator';
import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMultiChainTokenListRequestParams } from '../../lib/api/token/dtos/request/get-multi-chain-token-list-request-params.dto';
import { GetSingleChainTokenListPathParams } from '../../lib/api/token/dtos/request/get-single-chain-token-list-path-params.dto';
import { GetSingleChainTokenListRequestBody } from '../../lib/api/token/dtos/request/get-single-chain-token-list-request-body.dto';
import { GetTokenByAddressPathParams } from '../../lib/api/token/dtos/request/get-token-by-address-path-params.dto';
import { SearchMultichainTokensRequestParams } from '../../lib/api/token/dtos/request/search-multichain-tokens-request-params.dto';
import { GetMultiChainTokenListResponse } from '../../lib/api/token/dtos/response/get-multi-chain-token-list-response.dto';
import { GetSingleChainTokenListResponse } from '../../lib/api/token/dtos/response/get-single-chain-token-list-response.dto';
import { GetTokenByAddressResponse } from '../../lib/api/token/dtos/response/get-token-by-address-response.dto';
import { SearchMultichainTokensResponse } from '../../lib/api/token/dtos/response/search-multichain-tokens-response.dto';
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
  @ApiGetTokenByAddressDocs()
  async getTokenByAddress(
    @Param() params: GetTokenByAddressPathParams,
    @Query('chainIds', ParseChainIdArrayPipe) chainIds?: number[],
  ): Promise<GetTokenByAddressResponse> {
    const tokens = await this.tokensService.getTokensByAddress(params.tokenAddress, chainIds);

    return new GetTokenByAddressResponse(tokens);
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
}
