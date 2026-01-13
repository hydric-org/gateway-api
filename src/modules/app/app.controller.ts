import { ApiGetStatusDocs } from '@lib/app/decorators/get-status-docs.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('System')
export class AppController {
  @Get('/status')
  @ApiGetStatusDocs()
  getHealth() {
    return {
      status: 'OK',
      info: {
        version: process.env.npm_package_version || '0.0.0',
        env: process.env.ENVIRONMENT || 'development',
        uptime: Math.floor(process.uptime()),
      },
    };
  }
}
