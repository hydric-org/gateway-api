import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphQLClients {
  constructor() {
    this.poolsIndexerClient = new GraphQLClient(process.env.INDEXER_URL!);
  }

  poolsIndexerClient: GraphQLClient;
}
