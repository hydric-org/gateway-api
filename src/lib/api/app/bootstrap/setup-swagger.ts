import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const brandName = process.env.BRAND_NAME || 'Zup Protocol';

  const config = new DocumentBuilder()
    .setTitle(`${brandName} API`)
    .setDescription(`One plug. Every pool. Every network.`)
    .setVersion(process.env.npm_package_version || '1.0.0')
    .addTag('System', 'Core infrastructure and health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
