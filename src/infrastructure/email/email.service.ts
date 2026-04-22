import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailService {
  constructor(
    @InjectPinoLogger(EmailService.name)
    private readonly logger: PinoLogger,
  ) {}

  // TODO: Implement actual email sending logic using an email service provider
  // eslint-disable-next-line @typescript-eslint/require-await
  async sendBirthdayGreeting(name: string, email: string): Promise<void> {
    this.logger.info({ email }, `Happy Birthday, ${name}!`);
    console.log(
      `[Birthday] Happy Birthday, ${name}! Message sent to: ${email}`,
    );
  }
}
