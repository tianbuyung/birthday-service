import { Module } from '@nestjs/common';

import { EmailModule } from '@/infrastructure/email/email.module';
import { SchedulerModule } from '@/infrastructure/scheduler/scheduler.module';

import { BirthdayService } from './birthday.service';

@Module({
  imports: [SchedulerModule, EmailModule],
  providers: [BirthdayService],
  exports: [BirthdayService],
})
export class BirthdayModule {}
