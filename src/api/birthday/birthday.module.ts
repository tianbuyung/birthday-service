import { Module } from '@nestjs/common';

import { BirthdayService } from './birthday.service';

@Module({
  providers: [BirthdayService],
})
export class BirthdayModule {}
