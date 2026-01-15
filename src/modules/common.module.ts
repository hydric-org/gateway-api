import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [GraphQLClients, LiquidityPoolsIndexerClient],
  exports: [GraphQLClients, LiquidityPoolsIndexerClient],
})
export class CommonModule {}
