import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { join } from 'path';
import { CommonModule } from '../common.module';
import { PoolsModule } from '../pools/pools.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        ENVIRONMENT: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        ALLOWED_DOMAINS: Joi.string().required(),
        INDEXER_URL: Joi.string().required(),
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60000),
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'static'),
      serveRoot: '/static/',
      exclude: ['/api/(.*)', '/docs'],
    }),

    PoolsModule,
    ProtocolsModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
