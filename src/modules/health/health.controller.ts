import { HealthStatus } from '@lib/api/health/dtos/health-response-dto';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('System')
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
  @ApiOperation({
    summary: 'System Liveness Probe',
    description: 'Checks data base connectivity, memory usage, and external indexer availability.',
  })
  @ApiResponse({
    status: 200,
    description: 'The system is fully operational.',
    type: HealthStatus,
  })
  @ApiResponse({
    status: 503,
    description: 'The system is unhealthy (High memory or Indexer down).',
    type: HealthStatus,
  })
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
