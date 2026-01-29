import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { ITokenBasket } from '@core/interfaces/token/token-basket.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { TokensBasketsController } from './tokens-baskets.controller';
import { TokensBasketsService } from './tokens-baskets.service';

describe('TokensBasketsController', () => {
  let controller: TokensBasketsController;
  let service: TokensBasketsService;

  const mockBasketId = BasketId.USD_STABLECOINS;
  const mockChainId = ChainId.ETHEREUM;
  const mockResult = [{ id: BasketId.USD_STABLECOINS }] as unknown as ITokenBasket[];
  const mockSingleResult = { id: BasketId.USD_STABLECOINS } as unknown as ITokenBasket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensBasketsController],
      providers: [
        {
          provide: TokensBasketsService,
          useValue: {
            getMultiChainBaskets: jest.fn(),
            getSingleChainBaskets: jest.fn(),
            getSingleMultiChainBasket: jest.fn(),
            getSingleChainBasket: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TokensBasketsController>(TokensBasketsController);
    service = module.get<TokensBasketsService>(TokensBasketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMultiChainBaskets', () => {
    it('should call service.getMultiChainBaskets and return wrapped result', async () => {
      jest.spyOn(service, 'getMultiChainBaskets').mockResolvedValue(mockResult);

      const response = await controller.getMultiChainBaskets();
      expect(response.baskets).toBe(mockResult);
      expect(service.getMultiChainBaskets).toHaveBeenCalled();
    });
  });

  describe('getSingleChainBaskets', () => {
    it('should call service.getSingleChainBaskets and return wrapped result', async () => {
      jest.spyOn(service, 'getSingleChainBaskets').mockResolvedValue(mockResult);

      const response = await controller.getSingleChainBaskets({ chainId: mockChainId });
      expect(response.baskets).toBe(mockResult);
      expect(service.getSingleChainBaskets).toHaveBeenCalledWith(mockChainId);
    });
  });

  describe('getSingleMultiChainBasket', () => {
    it('should call service.getSingleMultiChainBasket and return wrapped result', async () => {
      jest.spyOn(service, 'getSingleMultiChainBasket').mockResolvedValue(mockSingleResult);

      const response = await controller.getSingleMultiChainBasket({ basketId: mockBasketId });
      expect(response.basket).toBe(mockSingleResult);
      expect(service.getSingleMultiChainBasket).toHaveBeenCalledWith(mockBasketId);
    });
  });

  describe('getSingleChainBasket', () => {
    it('should call service.getSingleChainBasket and return wrapped result', async () => {
      jest.spyOn(service, 'getSingleChainBasket').mockResolvedValue(mockSingleResult);

      const response = await controller.getSingleChainBasket({ chainId: mockChainId, basketId: mockBasketId });
      expect(response.basket).toBe(mockSingleResult);
      expect(service.getSingleChainBasket).toHaveBeenCalledWith(mockChainId, mockBasketId);
    });
  });
});
