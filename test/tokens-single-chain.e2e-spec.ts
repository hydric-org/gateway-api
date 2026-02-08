import { ChainId } from '@core/enums/chain-id';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityPoolsIndexerGetSingleChainTokensDocument } from 'src/gen/graphql.gen';
import { TokensController } from 'src/modules/tokens/tokens.controller';
import { TokensService } from 'src/modules/tokens/tokens.service';
import request from 'supertest';

describe('Tokens Single Chain (e2e)', () => {
  let app: INestApplication;
  let graphQLClients: GraphQLClients;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [
        TokensService,
        LiquidityPoolsIndexerClient,
        {
          provide: GraphQLClients,
          useValue: {
            liquidityPoolsIndexerClient: {
              request: jest.fn().mockResolvedValue({ SingleChainToken: [] }),
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    graphQLClients = moduleFixture.get<GraphQLClients>(GraphQLClients);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tokens/:chainId', () => {
    it('should pass chainId in the filter to the indexer graphql request', async () => {
      const chainId = ChainId.ETHEREUM;

      await request(app.getHttpServer()).post(`/tokens/${chainId}`).send({}).expect(200);

      expect(graphQLClients.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
          variables: expect.objectContaining({
            tokenFilter: expect.objectContaining({
              chainId: { _eq: chainId },
            }),
          }),
        }),
      );
    });

    it('should prioritize chainId from URL over body params (if any leak happened)', async () => {
      const chainId = ChainId.BASE;

      await request(app.getHttpServer()).post(`/tokens/${chainId}`).send({}).expect(200);

      expect(graphQLClients.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
          variables: expect.objectContaining({
            tokenFilter: expect.objectContaining({
              chainId: { _eq: chainId },
            }),
          }),
        }),
      );
    });
  });

  describe('POST /tokens/:chainId/search', () => {
    it('should pass chainId in the filter to the indexer graphql request during search', async () => {
      const chainId = ChainId.MONAD;
      const searchQuery = 'USDC';

      await request(app.getHttpServer()).post(`/tokens/${chainId}/search`).send({ search: searchQuery }).expect(200);

      expect(graphQLClients.liquidityPoolsIndexerClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          document: LiquidityPoolsIndexerGetSingleChainTokensDocument,
          variables: expect.objectContaining({
            tokenFilter: expect.objectContaining({
              chainId: expect.objectContaining({ _eq: chainId }),
              _or: expect.arrayContaining([expect.objectContaining({ symbol: { _ilike: `%${searchQuery}%` } })]),
            }),
          }),
        }),
      );
    });
  });
});
