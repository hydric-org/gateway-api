import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import 'src/core/extensions/string.extension';
import { AppModule } from './app.module';

export function bootstrap(app: INestApplication) {
  const environment = process.env.ENVIRONMENT;
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') ?? [];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (allowedDomains.some((domain) => origin?.endsWith(domain))) {
        return callback(null, true);
      }

      return callback(new UnauthorizedException('Origin domain is not allowed to access the API'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  };

  if (environment != 'development') app.enableCors(corsOptions);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}

async function startApplication() {
  const app = await NestFactory.create(AppModule, { cors: true });
  bootstrap(app);

  await app.listen(process.env.PORT ?? 3000);
}

if (require.main === module) void startApplication();
