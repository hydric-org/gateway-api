import { ApiGetProtocolsDocs } from '@lib/api/protocol/decorators/get-protocols-docs.decorator';
import { Protocol } from '@lib/api/protocol/dtos/protocol.dto';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProtocolsService } from './protocols.service';

@Controller('protocols')
@ApiTags('Protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  @ApiGetProtocolsDocs()
  async getProtocols(): Promise<Protocol[]> {
    return this.protocolsService.getAllSupportedProtocols();
  }
}
