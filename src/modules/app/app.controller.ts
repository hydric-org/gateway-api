import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/status')
  getStatus() {
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
