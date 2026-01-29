import { ApiGetMultiChainBasketsDocs } from '@lib/api/token/descorators/get-multi-chain-baskets-docs.decorator';
import { ApiGetSingleChainBasketDocs } from '@lib/api/token/descorators/get-single-chain-basket-docs.decorator';
import { ApiGetSingleChainBasketsDocs } from '@lib/api/token/descorators/get-single-chain-baskets-docs.decorator';
import { ApiGetSingleMultiChainBasketDocs } from '@lib/api/token/descorators/get-single-multi-chain-basket-docs.decorator';
import { GetSingleChainBasketPathParams } from '@lib/api/token/dtos/request/get-single-chain-basket-path-params.dto';
import { GetSingleChainBasketsPathParams } from '@lib/api/token/dtos/request/get-single-chain-baskets-path-params.dto';
import { GetSingleMultiChainBasketPathParams } from '@lib/api/token/dtos/request/get-single-multi-chain-basket-path-params.dto';
import { GetTokenBasketListResponse } from '@lib/api/token/dtos/response/get-token-basket-list-response.dto';
import { GetTokenBasketResponse } from '@lib/api/token/dtos/response/get-token-basket-response.dto';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokensBasketsService } from './tokens-baskets.service';

@ApiTags('Tokens')
@Controller('tokens/baskets')
export class TokensBasketsController {
  constructor(private readonly tokensBasketsService: TokensBasketsService) {}

  @Get('')
  @ApiGetMultiChainBasketsDocs()
  async getMultiChainBaskets(): Promise<GetTokenBasketListResponse> {
    const baskets = await this.tokensBasketsService.getMultiChainBaskets();
    return new GetTokenBasketListResponse(baskets);
  }

  @Get('chain/:chainId')
  @ApiGetSingleChainBasketsDocs()
  async getSingleChainBaskets(@Param() params: GetSingleChainBasketsPathParams): Promise<GetTokenBasketListResponse> {
    const baskets = await this.tokensBasketsService.getSingleChainBaskets(params.chainId);
    return new GetTokenBasketListResponse(baskets);
  }

  @Get(':basketId')
  @ApiGetSingleMultiChainBasketDocs()
  async getSingleMultiChainBasket(
    @Param() params: GetSingleMultiChainBasketPathParams,
  ): Promise<GetTokenBasketResponse> {
    const basket = await this.tokensBasketsService.getSingleMultiChainBasket(params.basketId);
    return new GetTokenBasketResponse(basket);
  }

  @Get(':chainId/:basketId')
  @ApiGetSingleChainBasketDocs()
  async getSingleChainBasket(@Param() params: GetSingleChainBasketPathParams): Promise<GetTokenBasketResponse> {
    const basket = await this.tokensBasketsService.getSingleChainBasket(params.chainId, params.basketId);
    return new GetTokenBasketResponse(basket);
  }
}
