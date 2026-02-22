import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PoolsController } from 'src/modules/pools/pools.controller';
import { PoolsService } from 'src/modules/pools/pools.service';
import request from 'supertest';

describe('Pools Native Token Handling (e2e)', () => {
  let app: INestApplication;
  let liquidityPoolsIndexerClient: LiquidityPoolsIndexerClient;

  const mockLiquidityPoolsIndexerClient = {
    getPools: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PoolsController],
      providers: [
        PoolsService,
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

  describe('POST /pools/search', () => {
    const dummyTokensA = [{ chainId: 1, address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' }];

    it('should pass parseWrappedToNative=AUTO by default', async () => {
      await request(app.getHttpServer())
        .post('/pools/search')
        .send({
          tokensA: dummyTokensA,
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          parseWrappedToNative: 'AUTO',
        }),
      );
    });

    it('should pass parseWrappedToNative=ALWAYS when requested', async () => {
      await request(app.getHttpServer())
        .post('/pools/search')
        .send({
          tokensA: dummyTokensA,
          config: {
            parseWrappedToNative: 'ALWAYS',
          },
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          parseWrappedToNative: 'ALWAYS',
        }),
      );
    });

    it('should pass parseWrappedToNative=NEVER when requested', async () => {
      await request(app.getHttpServer())
        .post('/pools/search')
        .send({
          tokensA: dummyTokensA,
          config: {
            parseWrappedToNative: 'NEVER',
          },
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          parseWrappedToNative: 'NEVER',
        }),
      );
    });

    it('should pass native token in tokensA correctly', async () => {
      const nativeToken = { chainId: ChainId.ETHEREUM, address: '0x0000000000000000000000000000000000000000' };

      await request(app.getHttpServer())
        .post('/pools/search')
        .send({
          tokensA: [nativeToken],
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          tokensA: expect.arrayContaining([expect.objectContaining(nativeToken)]),
        }),
      );
    });

    it('should pass useWrappedForNative=true by default', async () => {
      await request(app.getHttpServer())
        .post('/pools/search')
        .send({
          tokensA: dummyTokensA,
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          useWrappedForNative: true,
        }),
      );
    });

    it('should pass useWrappedForNative=false when requested', async () => {
      await request(app.getHttpServer())
        .post('/pools/search')
        .send({
          tokensA: dummyTokensA,
          config: {
            useWrappedForNative: false,
          },
        })
        .expect(200);

      expect(liquidityPoolsIndexerClient.getPools).toHaveBeenCalledWith(
        expect.objectContaining({
          useWrappedForNative: false,
        }),
      );
    });
  });
});
