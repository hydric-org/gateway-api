import { Global, Module } from '@nestjs/common';
import { GraphQLClients } from './core/graphql-clients';
import { IndexerClient } from './core/indexer-client';
import { MemoryCache } from './core/memory-cache';
import { RawQueryParser } from './core/raw-query-parser';
import { TokenRepository } from './core/repositories/token-repository';

@Global()
@Module({
  providers: [GraphQLClients, IndexerClient, MemoryCache, TokenRepository, RawQueryParser],
  exports: [GraphQLClients, IndexerClient, MemoryCache, TokenRepository, RawQueryParser],
})
export class CoreModule {}
