import { Inject, Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

import { type AppConfig, appConfig } from '@/config/app.config';

import { HEALTH_KEYS, HEALTH_THRESHOLDS } from './health.constants';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: AppConfig,
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const { protocol, host, port } = this.appConfiguration;
    const formattedHost =
      host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
    const docsUrl = new URL(
      '/documentation',
      `${protocol}://${formattedHost}:${port}`,
    ).toString();

    return this.health.check([
      // Alerts when disk usage exceeds 70% — prevents log/data write failures
      () =>
        this.disk.checkStorage(HEALTH_KEYS.DISK, {
          thresholdPercent: HEALTH_THRESHOLDS.DISK_PERCENT,
          path: HEALTH_THRESHOLDS.DISK_PATH,
        }),
      // V8 heap: memory actively used by JS objects. High heap = memory leak risk
      () =>
        this.memory.checkHeap(
          HEALTH_KEYS.MEMORY_HEAP,
          HEALTH_THRESHOLDS.MEMORY_HEAP_BYTES,
        ),
      // RSS (Resident Set Size): total physical RAM the process holds, including
      // heap, stack, and native buffers. High RSS with normal heap = native leak
      () =>
        this.memory.checkRSS(
          HEALTH_KEYS.MEMORY_RSS,
          HEALTH_THRESHOLDS.MEMORY_RSS_BYTES,
        ),
      // Verifies MongoDB is reachable and accepting queries
      () => this.mongoose.pingCheck(HEALTH_KEYS.MONGODB),
      // Verifies the Swagger docs endpoint is reachable (proxy/network sanity check)
      () => this.http.pingCheck(HEALTH_KEYS.DOCS, docsUrl),
    ]);
  }
}
