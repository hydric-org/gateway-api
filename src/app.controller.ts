import { Controller, Get } from '@nestjs/common';
import os from 'os';

@Controller()
export class AppController {
  @Get()
  getServiceStatus() {
    return {
      status: 'OK',
      uptimeSeconds: Math.floor(process.uptime()),
      env: process.env.ENVIRONMENT,
      host: os.hostname(),
      version: process.env.npm_package_version,
    };
  }
}
