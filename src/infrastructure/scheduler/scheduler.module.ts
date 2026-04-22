import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { databaseConfig } from '@/infrastructure/database/config/database.config';

import { agendaProvider } from './agenda.provider';
import { agendaConfig } from './config/agenda.config';
import { AGENDA_TOKEN } from './scheduler.constants';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    ConfigModule.forFeature(agendaConfig),
  ],
  providers: [agendaProvider],
  exports: [AGENDA_TOKEN],
})
export class SchedulerModule {}
