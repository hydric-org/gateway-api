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
            getBaskets: jest.fn(),
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

  describe('getBaskets', () => {
    it('should call service.getBaskets and return wrapped result', async () => {
      jest.spyOn(service, 'getBaskets').mockResolvedValue(mockResult);

      const response = await controller.getBaskets({});
      expect(response.baskets).toBe(mockResult);
      expect(service.getBaskets).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should pass chainIds to service when provided', async () => {
      jest.spyOn(service, 'getBaskets').mockResolvedValue(mockResult);
      const chainIds = [ChainId.ETHEREUM];

      const response = await controller.getBaskets({ chainIds });
      expect(response.baskets).toBe(mockResult);
      expect(service.getBaskets).toHaveBeenCalledWith(chainIds, undefined);
    });

    it('should pass basketIds to service when provided', async () => {
      jest.spyOn(service, 'getBaskets').mockResolvedValue(mockResult);
      const basketIds = [BasketId.USD_STABLECOINS];

      const response = await controller.getBaskets({ basketIds });
      expect(response.baskets).toBe(mockResult);
      expect(service.getBaskets).toHaveBeenCalledWith(undefined, basketIds);
    });

    it('should pass both chainIds and basketIds to service when both provided', async () => {
      jest.spyOn(service, 'getBaskets').mockResolvedValue(mockResult);
      const chainIds = [ChainId.ETHEREUM];
      const basketIds = [BasketId.USD_STABLECOINS];

      const response = await controller.getBaskets({ chainIds, basketIds });
      expect(response.baskets).toBe(mockResult);
      expect(service.getBaskets).toHaveBeenCalledWith(chainIds, basketIds);
    });
  });

  describe('getSingleBasketInMultipleChains', () => {
    it('should call service.getSingleBasketInMultipleChains and return wrapped result', async () => {
      jest.spyOn(service, 'getSingleBasketInMultipleChains').mockResolvedValue(mockSingleResult);

      const response = await controller.getSingleBasketInMultipleChains({ basketId: mockBasketId }, {});
      expect(response.basket).toBe(mockSingleResult);
      expect(service.getSingleBasketInMultipleChains).toHaveBeenCalledWith(mockBasketId, undefined);
    });

    it('should pass chainIds to service when provided', async () => {
      jest.spyOn(service, 'getSingleBasketInMultipleChains').mockResolvedValue(mockSingleResult);
      const chainIds = [ChainId.ETHEREUM];

      const response = await controller.getSingleBasketInMultipleChains({ basketId: mockBasketId }, { chainIds });
      expect(response.basket).toBe(mockSingleResult);
      expect(service.getSingleBasketInMultipleChains).toHaveBeenCalledWith(mockBasketId, chainIds);
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
