import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailService {
  constructor(
    @InjectPinoLogger(EmailService.name)
    private readonly logger: PinoLogger,
  ) {}

  sendBirthdayGreeting(name: string, email: string): void {
    this.logger.info({ email }, `Happy Birthday, ${name}!`);
    console.log(
      `[Birthday] Happy Birthday, ${name}! Message sent to: ${email}`,
    );
  }
}
