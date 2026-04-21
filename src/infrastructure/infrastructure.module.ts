import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
})
export class InfrastructureModule {}
