import { GraphQLClients } from './graphql-clients';

describe('GraphQLClients', () => {
  it('should assign the indexer client when instanciating the service', () => {
    const sut = new GraphQLClients();

    expect(sut.indexerClient).toBeDefined();
  });
});
