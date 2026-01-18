import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function setupCors(app: INestApplication) {
  const allowedHeaders = [
    'Content-Type',
    'Accept',
    'Authorization',
    'x-api-key',
    'x-trace-id',
    'Origin',
    'X-Requested-With',
  ];

  const corsOptions: CorsOptions = {
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
    allowedHeaders: allowedHeaders.join(','),
    credentials: true,
    origin: true,
  };

  app.enableCors(corsOptions);
}
