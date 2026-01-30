import { ApiKeyClient } from '@infrastructure/auth/clients/api-key.client';
import { GraphQLClients } from '@infrastructure/graphql/graphql-clients';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Global()
@Module({
  providers: [GraphQLClients, LiquidityPoolsIndexerClient, ApiKeyClient, AuthService],
  exports: [GraphQLClients, LiquidityPoolsIndexerClient, AuthService],
})
export class CommonModule {}
