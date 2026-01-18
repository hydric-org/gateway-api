import { ApiGetProtocolsDocs } from '@lib/api/protocol/decorators/get-protocols-docs.decorator';
import { GetProtocolsResponse } from '@lib/api/protocol/dtos/response/get-protocols-response.dto';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProtocolsService } from './protocols.service';

@Controller('protocols')
@ApiTags('Protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  @ApiGetProtocolsDocs()
  async getProtocols(): Promise<GetProtocolsResponse> {
    const protocols = await this.protocolsService.getAllSupportedProtocols();

    return new GetProtocolsResponse({
      protocols,
    });
  }
}
