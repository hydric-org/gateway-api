import { ChainId } from '@core/enums/chain-id';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenPricesService {
  constructor(private readonly liquidityPoolsIndexer: LiquidityPoolsIndexerClient) {}

  async getTokenUsdPrice(chainId: ChainId, tokenAddress: string): Promise<number> {
    return this.liquidityPoolsIndexer.getTokenPrice(chainId, tokenAddress);
  }
}
