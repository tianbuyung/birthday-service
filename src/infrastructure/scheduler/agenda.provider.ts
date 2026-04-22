import { MongoBackend } from '@agendajs/mongo-backend';
import { FactoryProvider } from '@nestjs/common';
import { Agenda } from 'agenda';

import {
  type DatabaseConfig,
  databaseConfig,
} from '@/infrastructure/database/config/database.config';

import { type AgendaConfig, agendaConfig } from './config/agenda.config';
import { AGENDA_TOKEN } from './scheduler.constants';

export const agendaProvider: FactoryProvider<Agenda> = {
  provide: AGENDA_TOKEN,
  inject: [databaseConfig.KEY, agendaConfig.KEY],
  useFactory: (dbConf: DatabaseConfig, agConf: AgendaConfig): Agenda => {
    return new Agenda({
      backend: new MongoBackend({
        address: dbConf.uri,
        collection: agConf.collection,
      }),
      defaultConcurrency: agConf.concurrency,
      maxConcurrency: agConf.concurrency,
      processEvery: agConf.processEvery,
    });
  },
};
