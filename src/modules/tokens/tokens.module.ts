import { BasketsModule } from '@infrastructure/baskets/baskets.module';
import { Module } from '@nestjs/common';
import { CommonModule } from '../common.module';
import { TokenPricesController } from './token-prices.controller';
import { TokenPricesService } from './token-prices.service';
import { TokensBasketsController } from './tokens-baskets.controller';
import { TokensBasketsService } from './tokens-baskets.service';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

@Module({
  imports: [CommonModule, BasketsModule],
  controllers: [TokensBasketsController, TokensController, TokenPricesController],
  providers: [TokensService, TokensBasketsService, TokenPricesService],
  exports: [TokensService],
})
export class TokensModule {}
