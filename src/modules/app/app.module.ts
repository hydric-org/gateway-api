import { EnvKey } from '@lib/app/env-key.enum';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { CommonModule } from '../common.module';
import { HealthModule } from '../health/health.module';
import { PoolsModule } from '../pools/pools.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        [EnvKey.ENVIRONMENT]: Joi.string().valid('development', 'production', 'staging').default('development'),
        [EnvKey.PORT]: Joi.number().default(3000),
        [EnvKey.ALLOWED_DOMAINS]: Joi.string().required(),
        [EnvKey.API_URL]: Joi.string().required(),
        [EnvKey.INDEXER_URL]: Joi.string()
          .required()
          .custom((value) => {
            if (typeof value === 'string') return value.replace(/^["']|["']$/g, '');
            return value;
          }),
      }),
    }),

    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          redact: ['req.headers.authorization', 'req.headers["x-api-key"]'],
          transport: config.get(EnvKey.ENVIRONMENT) === 'development' ? { target: 'pino-pretty' } : undefined,
        },
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

    PoolsModule,
    ProtocolsModule,
    CommonModule,
    HealthModule,
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
