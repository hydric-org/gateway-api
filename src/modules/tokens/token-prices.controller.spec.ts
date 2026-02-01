import { ChainId } from '@core/enums/chain-id';
import { GetTokenPricePathParams } from '@lib/api/token/dtos/request/get-token-price-path-params.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPricesController } from './token-prices.controller';
import { TokenPricesService } from './token-prices.service';

describe('TokenPricesController', () => {
  let controller: TokenPricesController;
  let service: TokenPricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenPricesController],
      providers: [
        {
          provide: TokenPricesService,
          useValue: {
            getTokenUsdPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TokenPricesController>(TokenPricesController);
    service = module.get<TokenPricesService>(TokenPricesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTokenPrice', () => {
    it('should return token price from service', async () => {
      const params: GetTokenPricePathParams = {
        chainId: ChainId.ETHEREUM,
        tokenAddress: '0x123',
      };
      const mockPrice = 123.45;
      jest.spyOn(service, 'getTokenUsdPrice').mockResolvedValue(mockPrice);

      const result = await controller.getTokenPrice(params);

      expect(result.price).toBe(mockPrice);
      expect(service.getTokenUsdPrice).toHaveBeenCalledWith(params.chainId, params.tokenAddress);
    });
  });
});
