import { ApiGetMultiChainTokenListDocs } from '@lib/api/token/descorators/get-multichain-token-list-docs.decorator';
import { ApiGetSingleChainTokenListDocs } from '@lib/api/token/descorators/get-single-chain-token-list-docs.decorator';
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMultiChainTokenListRequestParams } from '../../lib/api/token/dtos/request/get-multi-chain-token-list-request-params.dto';
import { GetSingleChainTokenListPathParams } from '../../lib/api/token/dtos/request/get-single-chain-token-list-path-params.dto';
import { GetSingleChainTokenListRequestBody } from '../../lib/api/token/dtos/request/get-single-chain-token-list-request-body.dto';
import { GetMultiChainTokenListResponse } from '../../lib/api/token/dtos/response/get-multi-chain-token-list-response.dto';
import { GetSingleChainTokenListResponse } from '../../lib/api/token/dtos/response/get-single-chain-token-list-response.dto';
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

  @Post('/:chainId')
  @HttpCode(200)
  @ApiGetSingleChainTokenListDocs()
  async getSingleChainTokenList(
    @Param() params: GetSingleChainTokenListPathParams,
    @Body() body: GetSingleChainTokenListRequestBody,
  ): Promise<GetSingleChainTokenListResponse> {
    const result = await this.tokensService.getSingleChainTokenList(params.chainId, body.config, body.filters);
    return new GetSingleChainTokenListResponse(result.tokens, result.nextCursor);
  }
}
