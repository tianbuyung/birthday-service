import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';

import { appConfig } from '@/config/app.config';

import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    TerminusModule,
    HttpModule,
    MongooseModule,
    ConfigModule.forFeature(appConfig),
  ],
})
export class HealthModule {}
