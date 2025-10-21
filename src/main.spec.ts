import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { bootstrap } from './main';

describe('Main ', () => {
  process.env.ENVIRONMENT = 'development';

  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    bootstrap(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should allow requests from any domain if the environment is development', async () => {
    process.env.ENVIRONMENT = 'development';

    app = moduleRef.createNestApplication();
    bootstrap(app);
    await app.init();

    return request(app.getHttpServer() as App)
      .get('/')
      .expect(200);
  });

  it('Should not allow requests from any domain if the environment is not development', async () => {
    process.env.ENVIRONMENT = 'any other environment';

    app = moduleRef.createNestApplication();
    bootstrap(app);
    await app.init();

    return request(app.getHttpServer() as App)
      .get('/')
      .expect(401)
      .expect('{"message":"Origin domain is not allowed to access the API","error":"Unauthorized","statusCode":401}');
  });

  it('Should allow requests from allowed domains if the environment is not development', async () => {
    process.env.ALLOWED_DOMAINS = 'example.com';
    process.env.ENVIRONMENT = 'production';

    app = moduleRef.createNestApplication();
    bootstrap(app);
    await app.init();

    return request(app.getHttpServer() as App)
      .get('/')
      .set('Origin', 'http://app.example.com')
      .expect(200);
  });

  it('Should not allow requests from other domains besides allowed ones if the environment is not development', async () => {
    process.env.ALLOWED_DOMAINS = 'example.com';
    process.env.ENVIRONMENT = 'production';

    app = moduleRef.createNestApplication();
    bootstrap(app);
    await app.init();

    return request(app.getHttpServer() as App)
      .get('/')
      .set('Origin', 'http://app.example.xyz')
      .expect(401);
  });
});
