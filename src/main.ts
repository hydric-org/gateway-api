import { setupCors } from '@lib/app/bootstrap/setup-cors';
import { setupPipes } from '@lib/app/bootstrap/setup-pipes';
import { setupSecurity } from '@lib/app/bootstrap/setup-security';
import { setupSwagger } from '@lib/app/bootstrap/setup-swagger';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import 'src/core/extensions/string.extension';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));

  setupSecurity(app);
  setupCors(app);
  setupPipes(app);

  app.useGlobalFilters(new AllExceptionsFilter());
  setupSwagger(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`API is live on port ${port} (Env: ${process.env.ENVIRONMENT})`);
}

void bootstrap();
