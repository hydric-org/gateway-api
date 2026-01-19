import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import { EnvKey } from '../env-key.enum';

export function setupSecurity(app: INestApplication) {
  const configService = app.get(ConfigService);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  app.use(compression());

  if (configService.get(EnvKey.ENVIRONMENT) === 'production') {
    app.use((req: any, res: any, next: any) => {
      const host = req.headers['host'];
      if (host !== 'api.hydric.org') return res.status(404).send('Not Found');

      next();
    });
  }
}
