import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const dbEnvSchema = z.object({
  MONGODB_URI: z.string().url(),
});

const databaseConfig = registerAs('database', () => {
  const parsed = dbEnvSchema.parse(process.env);
  return {
    uri: parsed.MONGODB_URI,
  };
});

type DatabaseConfig = ConfigType<typeof databaseConfig>;

export { databaseConfig, type DatabaseConfig };
