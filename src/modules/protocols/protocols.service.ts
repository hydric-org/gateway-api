import { IProtocol } from '@core/interfaces/protocol.interface';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtocolsService {
  constructor(private readonly indexerClient: LiquidityPoolsIndexerClient) {}

  async getAllSupportedProtocols(): Promise<IProtocol[]> {
    return await this.indexerClient.getAllSupportedDexs();
  }
}
