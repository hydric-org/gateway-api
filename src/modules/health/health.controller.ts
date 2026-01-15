import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const graphqlUrl = this.config.getOrThrow<string>('INDEXER_URL');
    const healthUrl = graphqlUrl.replace('/v1/graphql', '/healthz'.trim());

    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 256 * 1024 * 1024),
      () =>
        this.http.pingCheck('indexer', healthUrl, {
          timeout: 5000,
        }),
    ]);
  }
}
