import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller()
@ApiExcludeController()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'OK',
      info: {
        version: process.env.npm_package_version || '0.0.0',
        versionUptime: Math.floor(process.uptime()),
      },
    };
  }
}
