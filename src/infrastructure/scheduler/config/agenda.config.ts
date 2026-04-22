import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const agendaEnvSchema = z.object({
  AGENDA_COLLECTION: z.string().min(1),
  AGENDA_CONCURRENCY: z.coerce.number().int().positive(),
  AGENDA_PROCESS_EVERY: z.string().min(1),
});

const agendaConfig = registerAs('agenda', () => {
  const parsed = agendaEnvSchema.parse(process.env);
  return {
    collection: parsed.AGENDA_COLLECTION,
    concurrency: parsed.AGENDA_CONCURRENCY,
    processEvery: parsed.AGENDA_PROCESS_EVERY,
  };
});

type AgendaConfig = ConfigType<typeof agendaConfig>;

export { agendaConfig, type AgendaConfig };
