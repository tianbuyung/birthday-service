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
      () =>
        this.disk.checkStorage('disk', { thresholdPercent: 0.7, path: '/' }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      () => this.mongoose.pingCheck('mongodb'),
      () => this.http.pingCheck('docs', docsUrl),
    ]);
  }
}
