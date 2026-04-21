import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const dbEnvSchema = z.object({
  MONGODB_URI: z.string().url(),
  AGENDA_COLLECTION: z.string().min(1),
  AGENDA_CONCURRENCY: z.coerce.number().int().positive(),
});

const databaseConfig = registerAs('database', () => {
  const parsed = dbEnvSchema.parse(process.env);
  return {
    uri: parsed.MONGODB_URI,
    agendaCollection: parsed.AGENDA_COLLECTION,
    agendaConcurrency: parsed.AGENDA_CONCURRENCY,
  };
});

type DatabaseConfig = ConfigType<typeof databaseConfig>;

export { databaseConfig, type DatabaseConfig };
