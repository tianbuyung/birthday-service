import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Agenda } from 'agenda';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { EmailService } from '@/infrastructure/email/email.service';
import { AGENDA_TOKEN } from '@/infrastructure/scheduler/scheduler.constants';

import { BIRTHDAY_JOB_NAME } from './birthday.constants';
import { computeNextBirthday9AM } from './utils/timezone.util';

export interface BirthdayJobData {
  userId: string;
  name: string;
  email: string;
  /** ISO 8601 string — stored so the job can reschedule itself without a DB lookup */
  birthday: string;
  timezone: string;
}

@Injectable()
export class BirthdayService implements OnModuleInit, OnApplicationShutdown {
  constructor(
    @Inject(AGENDA_TOKEN) private readonly agenda: Agenda,
    private readonly emailService: EmailService,
    @InjectPinoLogger(BirthdayService.name)
    private readonly logger: PinoLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    this.defineJobs();
    await this.agenda.start();
    this.logger.info('Agenda scheduler started');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.agenda.stop();
    this.logger.info('Agenda scheduler stopped');
  }

  private defineJobs(): void {
    this.agenda.define<BirthdayJobData>(
      BIRTHDAY_JOB_NAME,
      async (job) => {
        const { userId, name, email, birthday, timezone } = job.attrs.data;

        this.logger.info({ userId }, `Sending birthday greeting to ${name}`);
        try {
          await this.emailService.sendBirthdayGreeting(name, email);
        } catch (err) {
          this.logger.error({ userId, err }, 'Birthday email failed');
        }

        // Reschedule for the same birthday next year without a DB lookup
        await this.schedule({ userId, name, email, birthday, timezone });
      },
      { removeOnComplete: true },
    );
  }

  /**
   * Atomically upserts the birthday job for this user using job.unique(),
   * which maps to a MongoDB findOneAndUpdate — safe under concurrent calls.
   * Fires at 9 AM on the next occurrence of the user's birthday in their timezone.
   */
  async schedule(data: BirthdayJobData): Promise<void> {
    const fireAt = computeNextBirthday9AM(
      new Date(data.birthday),
      data.timezone,
    );

    const job = this.agenda.create(BIRTHDAY_JOB_NAME, data);
    job.unique({ 'data.userId': data.userId });
    job.schedule(fireAt);
    await job.save();

    this.logger.info({ userId: data.userId, fireAt }, 'Birthday job scheduled');
  }

  async cancel(userId: string): Promise<void> {
    await this.agenda.cancel({ data: { userId } });
    this.logger.info({ userId }, 'Birthday job cancelled');
  }
}
