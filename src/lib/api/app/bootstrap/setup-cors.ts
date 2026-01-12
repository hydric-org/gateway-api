import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function setupCors(app: INestApplication) {
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') ?? [];

  const allowedHeaders = ['Content-Type', 'Accept', 'Authorization', 'x-api-key', 'x-trace-id'];

  const corsOptions: CorsOptions = {
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: allowedHeaders.join(','),
    credentials: true,

    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      try {
        const originHostname = new URL(origin).hostname;

        const isAllowed = allowedDomains.some((domain) => {
          if (originHostname === domain) return true;

          return originHostname.endsWith(`.${domain}`);
        });

        if (isAllowed) return callback(null, true);
      } catch {
        // Ignore
      }

      return callback(new Error('CORS Error: Origin not allowed'), false);
    },
  };

  if (process.env.ENVIRONMENT !== 'development') {
    app.enableCors(corsOptions);
  } else {
    app.enableCors();
  }
}
