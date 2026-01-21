import { ApiGetMultiChainTokenListDocs } from '@lib/api/token/descorators/get-multichain-token-list-docs.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMultiChainTokenListRequestParams } from '../../lib/api/token/dtos/request/get-multi-chain-token-list-request-params.dto';
import { GetMultiChainTokenListResponse } from '../../lib/api/token/dtos/response/get-multi-chain-token-list-response.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
@ApiTags('Tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  @ApiGetMultiChainTokenListDocs()
  async getMultiChainTokenList(
    @Body()
    body: GetMultiChainTokenListRequestParams,
  ): Promise<GetMultiChainTokenListResponse> {
    const tokens = await this.tokensService.getMultiChainTokenList(body.limit);
    return new GetMultiChainTokenListResponse(tokens);
  }
}
