import { MongoBackend } from '@agendajs/mongo-backend';
import { FactoryProvider } from '@nestjs/common';
import { Agenda } from 'agenda';

import {
  type DatabaseConfig,
  databaseConfig,
} from '@/infrastructure/database/config/database.config';

import { AGENDA_TOKEN } from './scheduler.constants';

export const agendaProvider: FactoryProvider<Agenda> = {
  provide: AGENDA_TOKEN,
  inject: [databaseConfig.KEY],
  useFactory: (dbConf: DatabaseConfig): Agenda => {
    return new Agenda({
      backend: new MongoBackend({
        address: dbConf.uri,
        collection: dbConf.agendaCollection,
      }),
      defaultConcurrency: dbConf.agendaConcurrency,
      maxConcurrency: dbConf.agendaConcurrency,
    });
  },
};
