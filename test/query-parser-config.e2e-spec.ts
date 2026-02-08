import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import * as qs from 'qs';
import request from 'supertest';

/**
 * E2E test to verify that the Express query parser (qs) is correctly configured
 * to handle array notation like basketIds[]=value and chainIds[]=1
 */
describe('Query Parser Configuration (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Configure Express query parser exactly as in main.ts
    app.set('query parser', (str: string) => qs.parse(str, { arrayLimit: 100 }));

    // Add a simple test route
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/test-query-parser', (req: any, res: any) => {
      res.json({ query: req.query });
    });

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Array notation parsing', () => {
    it('should parse basketIds[]=value into basketIds array', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-query-parser?basketIds[]=usd-stablecoins')
        .expect(200);

      expect(response.body.query.basketIds).toEqual(['usd-stablecoins']);
    });

    it('should parse multiple basketIds[]=a&basketIds[]=b into basketIds array', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-query-parser?basketIds[]=usd-stablecoins&basketIds[]=eth-pegged-tokens')
        .expect(200);

      expect(response.body.query.basketIds).toEqual(['usd-stablecoins', 'eth-pegged-tokens']);
    });

    it('should parse chainIds[]=1 into chainIds array', async () => {
      const response = await request(app.getHttpServer()).get('/test-query-parser?chainIds[]=1').expect(200);

      expect(response.body.query.chainIds).toEqual(['1']);
    });

    it('should parse multiple chainIds[]=1&chainIds[]=8453 into chainIds array', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-query-parser?chainIds[]=1&chainIds[]=8453')
        .expect(200);

      expect(response.body.query.chainIds).toEqual(['1', '8453']);
    });

    it('should parse mixed array and regular params', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-query-parser?chainIds[]=1&basketIds[]=usd-stablecoins&otherParam=value')
        .expect(200);

      expect(response.body.query.chainIds).toEqual(['1']);
      expect(response.body.query.basketIds).toEqual(['usd-stablecoins']);
      expect(response.body.query.otherParam).toBe('value');
    });

    it('should handle comma-separated values as single string (not array)', async () => {
      const response = await request(app.getHttpServer()).get('/test-query-parser?chainIds=1,8453').expect(200);

      // qs parser doesn't split comma-separated values - that's handled by our transformer
      expect(response.body.query.chainIds).toBe('1,8453');
    });

    it('should handle single value without brackets as string', async () => {
      const response = await request(app.getHttpServer()).get('/test-query-parser?chainIds=1').expect(200);

      expect(response.body.query.chainIds).toBe('1');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array notation', async () => {
      const response = await request(app.getHttpServer()).get('/test-query-parser?basketIds[]=').expect(200);

      expect(response.body.query.basketIds).toEqual(['']);
    });

    it('should handle mixed notation for same param', async () => {
      const response = await request(app.getHttpServer()).get('/test-query-parser?ids[]=1&ids[]=2&ids=3').expect(200);

      // When mixing array and non-array notation, qs creates an array
      expect(Array.isArray(response.body.query.ids)).toBe(true);
    });
  });
});
