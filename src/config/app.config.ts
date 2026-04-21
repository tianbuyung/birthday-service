import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SERVICE_NAME: z.string(),
  HOST: z.string(),
  PORT: z.coerce.number().int().positive(),
  WHITELIST: z.string(),
});

const appConfig = registerAs('app', () => {
  const parsed = appEnvSchema.parse(process.env);

  return {
    environment: parsed.NODE_ENV,
    serviceName: parsed.SERVICE_NAME,
    protocol: parsed.NODE_ENV === 'production' ? 'https' : 'http',
    host: parsed.HOST,
    port: parsed.PORT,
    whitelist: parsed.WHITELIST.split(',').map((item) => item.trim()),
  };
});

type AppConfig = ConfigType<typeof appConfig>;

export { appConfig, type AppConfig };
