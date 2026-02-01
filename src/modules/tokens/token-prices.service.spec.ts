import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPricesService } from './token-prices.service';

describe('TokenPricesService', () => {
  let service: TokenPricesService;
  let indexerClient: LiquidityPoolsIndexerClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenPricesService,
        {
          provide: LiquidityPoolsIndexerClient,
          useValue: {
            getTokenPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenPricesService>(TokenPricesService);
    indexerClient = module.get<LiquidityPoolsIndexerClient>(LiquidityPoolsIndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokenUsdPrice', () => {
    it('should call indexerClient.getTokenPrice', async () => {
      const chainId = ChainId.ETHEREUM;
      const tokenAddress = '0x123';
      const mockPrice = 100.5;
      jest.spyOn(indexerClient, 'getTokenPrice').mockResolvedValue(mockPrice);

      const result = await service.getTokenUsdPrice(chainId, tokenAddress);

      expect(result).toBe(mockPrice);
      expect(indexerClient.getTokenPrice).toHaveBeenCalledWith(chainId, tokenAddress);
    });
  });
});
