import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle(`Hydric Pools API`)
    .setDescription(`Access liquidity pools from DEXs easily. One plug. Every pool. Every network.`)
    .setVersion(process.env.npm_package_version || '1.0.0')
    .addTag('System', 'Core infrastructure and health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}
