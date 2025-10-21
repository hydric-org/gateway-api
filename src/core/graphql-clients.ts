import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphQLClients {
  constructor() {
    this.indexerClient = new GraphQLClient(process.env.INDEXER_URL!);
  }

  indexerClient: GraphQLClient;
}
