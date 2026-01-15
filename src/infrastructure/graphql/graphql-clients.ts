import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphQLClients {
  constructor() {
    this.liquidityPoolsIndexerClient = new GraphQLClient(process.env.INDEXER_URL!);
  }

  liquidityPoolsIndexerClient: GraphQLClient;
}
