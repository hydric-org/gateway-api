import { IProtocol } from '@core/interfaces/protocol.interface';
import { LiquidityPoolsIndexerClient } from '@infrastructure/liquidity-pools-indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtocolsService {
  constructor(private readonly liquidityPoolsIndexerClient: LiquidityPoolsIndexerClient) {}

  async getAllSupportedProtocols(): Promise<IProtocol[]> {
    return await this.liquidityPoolsIndexerClient.getAllSupportedDexs();
  }
}
