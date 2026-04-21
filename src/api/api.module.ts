import { Module } from '@nestjs/common';

import { BirthdayModule } from './birthday/birthday.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HealthModule, UsersModule, BirthdayModule],
})
export class ApiModule {}
