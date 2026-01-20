import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMultiChainTokenListResponse } from './dto/get-multi-chain-token-list-response.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
@ApiTags('Tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of top multi-chain tokens ranked by TVL' })
  @ApiOkResponse({
    description: 'List of multi-chain tokens',
    type: GetMultiChainTokenListResponse,
  })
  async getMultiChainTokenList(): Promise<GetMultiChainTokenListResponse> {
    const tokens = await this.tokensService.getMultiChainTokenList();
    return new GetMultiChainTokenListResponse(tokens);
  }
}
