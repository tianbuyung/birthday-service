import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

import { AppConfigService } from './app-config.service';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true }, // buffer logs until Pino is ready
  );
  const logger = app.get(Logger);
  const { host, port } = app.get(AppConfigService).server;

  app.useLogger(logger);
  app.setGlobalPrefix('api');
  swaggerConfig(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableShutdownHooks();

  await app.listen(port, host);

  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Error occurred during bootstrap:', error);
  process.exit(1);
});
