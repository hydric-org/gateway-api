import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokensBasketsController } from 'src/modules/tokens/tokens-baskets.controller';
import { TokensBasketsService } from 'src/modules/tokens/tokens-baskets.service';
import { TokensController } from 'src/modules/tokens/tokens.controller';
import { TokensService } from 'src/modules/tokens/tokens.service';
import request from 'supertest';

describe('Tokens Routing (e2e)', () => {
  let app: INestApplication;
  let tokensService: TokensService;
  let tokensBasketsService: TokensBasketsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TokensBasketsController, TokensController],
      providers: [
        {
          provide: TokensService,
          useValue: {
            searchTokensByAddress: jest.fn(),
          },
        },
        {
          provide: TokensBasketsService,
          useValue: {
            getBaskets: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    tokensService = moduleFixture.get<TokensService>(TokensService);
    tokensBasketsService = moduleFixture.get<TokensBasketsService>(TokensBasketsService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tokens/baskets should be handled by TokensBasketsController, not TokensController', async () => {
    const mockBaskets = [{ id: 'usd-stablecoins', name: 'USD Stablecoins' }];
    (tokensBasketsService.getBaskets as jest.Mock).mockResolvedValue(mockBaskets);
    (tokensService.searchTokensByAddress as jest.Mock).mockResolvedValue([]);

    const response = await request(app.getHttpServer()).get('/tokens/baskets').expect(200);

    expect(response.body).toEqual({
      baskets: mockBaskets,
      count: 1,
    });
    expect(tokensBasketsService.getBaskets).toHaveBeenCalled();
    expect(tokensService.searchTokensByAddress).not.toHaveBeenCalled();
  });

  it('GET /tokens/:address should be handled by TokensController', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    (tokensService.searchTokensByAddress as jest.Mock).mockResolvedValue([{ address: mockAddress }]);

    const response = await request(app.getHttpServer()).get(`/tokens/${mockAddress}`).expect(200);

    expect(response.body).toEqual({
      tokens: [{ address: mockAddress }],
      count: 1,
    });
    expect(tokensService.searchTokensByAddress).toHaveBeenCalledWith(mockAddress, undefined);
  });
});
