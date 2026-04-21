import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { ApiModule } from './api/api.module';
import { AppConfigService } from './app-config.service';
import { appConfig } from './config/app.config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { LoggerConfig } from './infrastructure/logger/config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    LoggerModule.forRootAsync(LoggerConfig),
    ApiModule,
    InfrastructureModule,
  ],
  providers: [AppConfigService],
})
export class AppModule {}
