import { ObjectCostInterceptor } from '@lib/api/interceptors/object-cost.interceptor';
import { SuccessResponseInterceptor } from '@lib/api/interceptors/success-response.interceptor';
import { setupCors } from '@lib/app/bootstrap/setup-cors';
import { setupPipes } from '@lib/app/bootstrap/setup-pipes';
import { setupSecurity } from '@lib/app/bootstrap/setup-security';
import { setupSwagger } from '@lib/app/bootstrap/setup-swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import 'src/core/extensions/string.extension';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { AppModule } from './modules/app/app.module';
import { AuthService } from './modules/auth/auth.service';
import { ApiKeyGuard } from './modules/auth/guards/api-key.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);

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
    new ObjectCostInterceptor(reflector),
  );
  setupSwagger(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`API is live on port ${port} (Env: ${process.env.ENVIRONMENT})`);
}

void bootstrap();
