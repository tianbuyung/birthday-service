import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const { version } = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
) as { version: string };

export const swaggerConfig = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Birthday Reminder Service')
    .setDescription('API for managing users and birthday reminder scheduling')
    .setVersion(version)
    .setExternalDoc('Postman Collection', '/documentation-json')
    .addCookieAuth('Authentication')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
