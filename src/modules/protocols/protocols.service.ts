import { IProtocol } from '@core/interfaces/protocol.interface';
import { PoolsIndexerClient } from '@infrastructure/indexer/clients/pools-indexer-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtocolsService {
  constructor(private readonly indexerClient: PoolsIndexerClient) {}

  async getAllSupportedProtocols(): Promise<IProtocol[]> {
    return await this.indexerClient.getAllSupportedDexs();
  }
}
