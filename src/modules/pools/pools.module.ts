import { BasketsModule } from '@infrastructure/baskets/baskets.module';
import { Module } from '@nestjs/common';

import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

@Module({
  imports: [BasketsModule],
  controllers: [PoolsController],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
