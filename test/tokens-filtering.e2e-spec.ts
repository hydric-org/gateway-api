import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokensBasketsController } from 'src/modules/tokens/tokens-baskets.controller';
import { TokensBasketsService } from 'src/modules/tokens/tokens-baskets.service';
import { TokensController } from 'src/modules/tokens/tokens.controller';
import { TokensService } from 'src/modules/tokens/tokens.service';
import request from 'supertest';

describe('Tokens Filtering (e2e)', () => {
  let app: INestApplication;
  let liquidityPoolsIndexerClient: LiquidityPoolsIndexerClient;

  const mockLiquidityPoolsIndexerClient = {
    getTokensForMultichainAggregation: jest.fn().mockResolvedValue([]),
    getSingleChainTokens: jest.fn().mockResolvedValue([]),
    getToken: jest.fn(),
    getTokenPrice: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TokensController, TokensBasketsController],
      providers: [
        TokensService,
        {
          provide: TokensBasketsService,
          useValue: {
            getBaskets: jest.fn(),
          },
        },
        {
          provide: LiquidityPoolsIndexerClient,
          useValue: mockLiquidityPoolsIndexerClient,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    liquidityPoolsIndexerClient = moduleFixture.get<LiquidityPoolsIndexerClient>(LiquidityPoolsIndexerClient);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /tokens', () => {
    it('should exclude wrapped native tokens by default (ignoreWrappedNative=true)', async () => {
      await request(app.getHttpServer()).post('/tokens').send({}).expect(200);

      expect(liquidityPoolsIndexerClient.getTokensForMultichainAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            ignoreWrappedNative: true,
          }),
        }),
      );
    });

    it('should include wrapped native tokens when ignoreWrappedNative=false', async () => {
      await request(app.getHttpServer())
        .post('/tokens')
        .send({
          filters: { ignoreWrappedNative: false },
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getTokensForMultichainAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            ignoreWrappedNative: false,
          }),
        }),
      );
    });
  });

  describe('POST /tokens/search', () => {
    it('should INCLUDE wrapped native tokens by default (ignoreWrappedNative=false)', async () => {
      await request(app.getHttpServer()).post('/tokens/search').send({ search: 'eth' }).expect(200);

      expect(liquidityPoolsIndexerClient.getTokensForMultichainAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            ignoreWrappedNative: false,
          }),
        }),
      );
    });

    it('should exclude wrapped native tokens when explicitly requested', async () => {
      await request(app.getHttpServer())
        .post('/tokens/search')
        .send({
          search: 'eth',
          filters: { ignoreWrappedNative: true },
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getTokensForMultichainAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            ignoreWrappedNative: true,
          }),
        }),
      );
    });
  });

  describe('POST /tokens/:chainId', () => {
    it('should exclude wrapped native tokens by default', async () => {
      await request(app.getHttpServer()).post(`/tokens/${ChainId.ETHEREUM}`).send({}).expect(200);

      expect(liquidityPoolsIndexerClient.getSingleChainTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            ignoreWrappedNative: true,
          }),
        }),
      );
    });
  });

  describe('POST /tokens/:chainId/search', () => {
    it('should INCLUDE wrapped native tokens by default', async () => {
      await request(app.getHttpServer()).post(`/tokens/${ChainId.ETHEREUM}/search`).send({ search: 'eth' }).expect(200);

      expect(liquidityPoolsIndexerClient.getSingleChainTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            ignoreWrappedNative: false,
          }),
        }),
      );
    });
  });
});
