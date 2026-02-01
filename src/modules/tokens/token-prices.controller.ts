import { ApiGetTokenUsdPriceDocs } from '@lib/api/token/descorators/get-usd-token-price-docs.decorator';
import { GetTokenPricePathParams } from '@lib/api/token/dtos/request/get-token-price-path-params.dto';
import { GetTokenPriceResponse } from '@lib/api/token/dtos/response/get-token-price-response.dto';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenPricesService } from './token-prices.service';

@Controller('tokens/prices')
@ApiTags('Token Prices')
export class TokenPricesController {
  constructor(private readonly tokenPricesService: TokenPricesService) {}

  @Get('/:chainId/:tokenAddress/usd')
  @ApiGetTokenUsdPriceDocs()
  async getTokenPrice(@Param() params: GetTokenPricePathParams): Promise<GetTokenPriceResponse> {
    const price = await this.tokenPricesService.getTokenUsdPrice(params.chainId, params.tokenAddress);
    return new GetTokenPriceResponse(price);
  }
}
