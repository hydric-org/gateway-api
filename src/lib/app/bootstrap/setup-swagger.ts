import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvKey } from '../env-key.enum';

export function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiUrl = configService.get(EnvKey.API_URL);

  let configBuilder = new DocumentBuilder()
    .setTitle(`hydric Gateway API`)
    .setDescription(`Access DeFi Liquidity easily. One plug. Every Protocol. Every Network.`)
    .setVersion(process.env.npm_package_version || '1.0.0')
    .setOpenAPIVersion('3.1.0')
    .addBearerAuth(
      {
        scheme: 'bearer',
        type: 'http',
        bearerFormat: 'JWT',
        description: `Use the docs sandbox API key for authentication: **${configService.get(EnvKey.DOCS_API_KEY)}**`,
      },
      'bearerAuth',
    )
    .addSecurityRequirements('bearerAuth')
    .addServer(apiUrl);

  const config = configBuilder.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: '/openapi.json',
    yamlDocumentUrl: '/openapi.yaml',
  });
}
