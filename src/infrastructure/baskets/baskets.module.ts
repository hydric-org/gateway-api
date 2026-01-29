import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TokenBasketsClient } from './clients/token-baskets.client';

@Module({
  imports: [HttpModule],
  providers: [TokenBasketsClient],
  exports: [TokenBasketsClient],
})
export class BasketsModule {}
