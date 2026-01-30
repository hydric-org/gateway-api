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
            getMultipleChainsBaskets: jest.fn(),
            getSingleChainBaskets: jest.fn(),
            getSingleBasketInMultipleChains: jest.fn(),
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

  describe('getMultipleChainsBaskets', () => {
    it('should call service.getMultipleChainsBaskets and return wrapped result', async () => {
      jest.spyOn(service, 'getMultipleChainsBaskets').mockResolvedValue(mockResult);

      const response = await controller.getMultipleChainsBaskets();
      expect(response.baskets).toBe(mockResult);
      expect(service.getMultipleChainsBaskets).toHaveBeenCalled();
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

  describe('getSingleBasketInMultipleChains', () => {
    it('should call service.getSingleBasketInMultipleChains and return wrapped result', async () => {
      jest.spyOn(service, 'getSingleBasketInMultipleChains').mockResolvedValue(mockSingleResult);

      const response = await controller.getSingleBasketInMultipleChains({ basketId: mockBasketId });
      expect(response.basket).toBe(mockSingleResult);
      expect(service.getSingleBasketInMultipleChains).toHaveBeenCalledWith(mockBasketId);
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
