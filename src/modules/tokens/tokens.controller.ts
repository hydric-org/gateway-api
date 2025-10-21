import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ZERO_ETHEREUM_ADDRESS } from 'src/core/constants';
import { MultichainTokenDTO } from 'src/core/dtos/multi-chain-token.dto';
import { SingleChainTokenDTO } from 'src/core/dtos/single-chain-token-dto';
import { TokenListDTO } from 'src/core/dtos/token-list.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { ParseAddressPipe } from 'src/core/pipes/address.pipe';
import { ParseChainIdPipe, ParseOptionalChainIdPipe } from 'src/core/pipes/chain-id.pipe';
import { ParseSearchQueryPipe } from 'src/core/pipes/search-query.pipe';
import { isEthereumAddress } from 'src/core/utils/string-utils';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('/list')
  getTokenList(@Query('chainId', ParseOptionalChainIdPipe) chainId: Networks): TokenListDTO {
    const tokens = this.tokensService.getPopularTokens(chainId);
    const groups = this.tokensService.getTokenGroups(chainId);

    return {
      popularTokens: tokens,
      tokenGroups: groups,
    };
  }

  @Get('/search/all')
  async searchTokensCrosschain(@Query('query', ParseSearchQueryPipe) query: string): Promise<MultichainTokenDTO[]> {
    if (isEthereumAddress(query)) {
      throw new BadRequestException(`Searching Cross Chain Tokens by address is not supported`);
    }

    return Promise.resolve(this.tokensService.searchTokensByNameOrSymbol(query));
  }

  @Get('/search/:chainId')
  async searchTokensSingleChain(
    @Query('query', ParseSearchQueryPipe) query: string,
    @Param('chainId', ParseChainIdPipe)
    chainId: Networks,
  ): Promise<SingleChainTokenDTO[]> {
    if (isEthereumAddress(query)) return [await this.getTokenByAddress(query, chainId)];

    const tokens = this.tokensService.searchTokensByNameOrSymbol(query, chainId);

    const tokensAsSingleChainTokens: SingleChainTokenDTO[] = tokens.map((token) => ({
      address: token.addresses[chainId]!,
      decimals: token.decimals[chainId]!,
      name: token.name,
      symbol: token.symbol,
      logoUrl: token.logoUrl,
    }));

    return Promise.resolve(tokensAsSingleChainTokens);
  }

  @Get('/:address/:chainId')
  async getTokenByAddress(
    @Param('address', ParseAddressPipe) address: string,
    @Param('chainId', ParseChainIdPipe) chainId: number,
  ): Promise<SingleChainTokenDTO> {
    return this.tokensService.getTokenByAddress(chainId, address);
  }

  @Get('/:address/:chainId/price')
  async getTokenPrice(
    @Param('address', ParseAddressPipe) address: string,
    @Param('chainId', ParseChainIdPipe) chainId: number,
  ): Promise<TokenPriceDTO> {
    const tokenPrice = await this.tokensService.getTokenPrice(address, chainId);

    if (tokenPrice.usdPrice === 0 && address.lowercasedEquals(ZERO_ETHEREUM_ADDRESS)) {
      return await this.tokensService.getTokenPrice(NetworksUtils.wrappedNativeAddress(chainId), chainId);
    }

    return tokenPrice;
  }
}
