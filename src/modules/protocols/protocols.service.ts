import { Injectable } from '@nestjs/common';
import { ProtocolDTO } from 'src/core/dtos/protocol.dto';
import { IndexerClient } from 'src/core/indexer-client';

@Injectable()
export class ProtocolsService {
  constructor(private readonly indexerClient: IndexerClient) {}

  async getAllSupportedProtocols(): Promise<ProtocolDTO[]> {
    return await this.indexerClient.queryAllProtocols();
  }
}
