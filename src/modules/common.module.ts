import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { PoolsIndexerClient } from '@infrastructure/indexer/clients/pools-indexer-client';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [GraphQLClients, PoolsIndexerClient],
  exports: [GraphQLClients, PoolsIndexerClient],
})
export class CommonModule {}
