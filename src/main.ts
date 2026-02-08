import { ObjectCostInterceptor } from '@lib/api/interceptors/object-cost.interceptor';
import { SuccessResponseInterceptor } from '@lib/api/interceptors/success-response.interceptor';
import { setupCors } from '@lib/app/bootstrap/setup-cors';
import { setupPipes } from '@lib/app/bootstrap/setup-pipes';
import { setupSecurity } from '@lib/app/bootstrap/setup-security';
import { setupSwagger } from '@lib/app/bootstrap/setup-swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import * as qs from 'qs';
import 'src/core/extensions/string.extension';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { AppModule } from './modules/app/app.module';
import { AuthService } from './modules/auth/auth.service';
import { ApiKeyGuard } from './modules/auth/guards/api-key.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.set('query parser', (str: string) => qs.parse(str, { arrayLimit: 100 }));

  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('/v1', {
    exclude: ['/health', '/'],
  });
  app.useLogger(app.get(Logger));

  setupSecurity(app);
  setupCors(app);
  setupPipes(app);

  app.useGlobalGuards(new ApiKeyGuard(authService, reflector));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new SuccessResponseInterceptor(),
    new ClassSerializerInterceptor(reflector),

    // this interceptor should be the last one so it can calculate the credits of the response without any transformation
    new ObjectCostInterceptor(reflector, configService),
  );
  setupSwagger(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`API is live on port ${port} (Env: ${process.env.ENVIRONMENT})`);
}

void bootstrap();
