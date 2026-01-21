import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { Agent } from 'undici';

const persistentAgent = new Agent({
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 60_000,
  connections: 50,
  pipelining: 1,
});

@Injectable()
export class GraphQLClients {
  constructor() {
    this.liquidityPoolsIndexerClient = new GraphQLClient(process.env.INDEXER_URL!, {
      fetch: (url: any, options: any) =>
        fetch(url, {
          ...options,
          dispatcher: persistentAgent,
          keepalive: true,
        }),
    });
  }

  liquidityPoolsIndexerClient: GraphQLClient;
}
