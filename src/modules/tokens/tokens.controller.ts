import { ApiGetMultiChainTokenListDocs } from '@lib/api/token/descorators/get-multichain-token-list-docs.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMultiChainTokenListResponse } from '../../lib/api/token/dtos/response/get-multi-chain-token-list-response.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
@ApiTags('Tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiGetMultiChainTokenListDocs()
  async getMultiChainTokenList(): Promise<GetMultiChainTokenListResponse> {
    const tokens = await this.tokensService.getMultiChainTokenList();
    return new GetMultiChainTokenListResponse(tokens);
  }
}
