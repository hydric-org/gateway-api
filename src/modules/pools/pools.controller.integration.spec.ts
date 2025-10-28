import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PoolsController } from 'src/modules/pools/pools.controller';
import { PoolsService } from 'src/modules/pools/pools.service';
import request from 'supertest';
import { App } from 'supertest/types';

describe('PoolsController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [PoolsController],
      providers: [
        {
          provide: PoolsService,
          useValue: { searchPoolsInChain: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /pools/search/:chainId should return 200 on success', async () => {
    const chainId = 1;

    await request(app.getHttpServer() as App)
      .post(`/pools/search/${chainId}`)
      .send({
        filters: {},
        config: {},
      })
      .expect(200);
  });

  it('POST /pools/search/all should return 200 on success', async () => {
    await request(app.getHttpServer() as App)
      .post('/pools/search/all')
      .send({
        filters: {},
        config: {},
      })
      .expect(200);
  });
});
