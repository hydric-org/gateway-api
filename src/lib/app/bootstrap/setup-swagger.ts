import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvKey } from '../env-key.enum';

export function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiUrl = configService.get(EnvKey.API_URL);

  let configBuilder = new DocumentBuilder()
    .setTitle(`Hydric Pools API`)
    .setDescription(`Access liquidity pools from DEXs easily. One plug. Every pool. Every network.`)
    .setVersion(process.env.npm_package_version || '1.0.0')
    .setOpenAPIVersion('3.1.0')
    .addServer(apiUrl)
    .addTag('System', 'Core infrastructure and health checks');

  const config = configBuilder.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}
