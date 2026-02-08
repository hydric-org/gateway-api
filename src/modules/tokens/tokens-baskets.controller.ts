import { ChainId } from '@core/enums/chain-id';
import { ApiGetMultipleChainBasketsDocs } from '@lib/api/token/decorators/get-multi-chain-baskets-docs.decorator';
import { ApiGetSingleChainBasketDocs } from '@lib/api/token/decorators/get-single-chain-basket-docs.decorator';
import { ApiGetSingleBasketInMultipleChainsDocs } from '@lib/api/token/decorators/get-single-multi-chain-basket-docs.decorator';
import { GetSingleChainBasketPathParams } from '@lib/api/token/dtos/request/get-single-chain-basket-path-params.dto';
import { GetSingleMultiChainBasketPathParams } from '@lib/api/token/dtos/request/get-single-multi-chain-basket-path-params.dto';
import { GetTokenBasketListResponse } from '@lib/api/token/dtos/response/get-token-basket-list-response.dto';
import { GetTokenBasketResponse } from '@lib/api/token/dtos/response/get-token-basket-response.dto';
import { ParseChainIdArrayPipe } from '@lib/api/token/pipes/parse-chain-id-array.pipe';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokensBasketsService } from './tokens-baskets.service';

@ApiTags('Token Baskets')
@Controller('tokens/baskets')
export class TokensBasketsController {
  constructor(private readonly tokensBasketsService: TokensBasketsService) {}

  @Get('')
  @ApiGetMultipleChainBasketsDocs()
  async getBaskets(
    @Query('chainIds', ParseChainIdArrayPipe) chainIds?: ChainId[],
  ): Promise<GetTokenBasketListResponse> {
    const baskets = await this.tokensBasketsService.getBaskets(chainIds);
    return new GetTokenBasketListResponse(baskets);
  }

  @Get(':basketId')
  @ApiGetSingleBasketInMultipleChainsDocs()
  async getSingleBasketInMultipleChains(
    @Param() params: GetSingleMultiChainBasketPathParams,
    @Query('chainIds', ParseChainIdArrayPipe) chainIds?: ChainId[],
  ): Promise<GetTokenBasketResponse> {
    const basket = await this.tokensBasketsService.getSingleBasketInMultipleChains(params.basketId, chainIds);
    return new GetTokenBasketResponse(basket);
  }

  @Get(':chainId/:basketId')
  @ApiGetSingleChainBasketDocs()
  async getSingleChainBasket(@Param() params: GetSingleChainBasketPathParams): Promise<GetTokenBasketResponse> {
    const basket = await this.tokensBasketsService.getSingleChainBasket(params.chainId, params.basketId);
    return new GetTokenBasketResponse(basket);
  }
}
