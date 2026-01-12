import { setupCors } from '@lib/api/app/bootstrap/setup-cors';
import { setupPipes } from '@lib/api/app/bootstrap/setup-pipes';
import { setupSecurity } from '@lib/api/app/bootstrap/setup-security';
import { setupSwagger } from '@lib/api/app/bootstrap/setup-swagger';
import { NestFactory } from '@nestjs/core';
import 'src/core/extensions/string.extension';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSecurity(app);
  setupCors(app);
  setupPipes(app);

  app.useGlobalFilters(new AllExceptionsFilter());
  setupSwagger(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`API is live on port ${port} (Env: ${process.env.ENVIRONMENT})`);
}

void bootstrap();
