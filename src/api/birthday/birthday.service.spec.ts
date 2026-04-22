import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { getLoggerToken } from 'nestjs-pino';

import { EmailService } from '@/infrastructure/email/email.service';
import { AGENDA_TOKEN } from '@/infrastructure/scheduler/scheduler.constants';

import { BIRTHDAY_JOB_NAME } from './birthday.constants';
import { BirthdayJobData, BirthdayService } from './birthday.service';

const mockJobData: BirthdayJobData = {
  userId: 'user-abc123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  birthday: '1990-04-21T00:00:00.000Z',
  timezone: 'Asia/Jakarta',
};

describe('BirthdayService', () => {
  let service: BirthdayService;
  let mockJob: { unique: jest.Mock; schedule: jest.Mock; save: jest.Mock };
  let mockAgenda: {
    define: jest.Mock;
    start: jest.Mock;
    stop: jest.Mock;
    create: jest.Mock;
    cancel: jest.Mock;
  };
  let mockEmailService: { sendBirthdayGreeting: jest.Mock };
  let mockLogger: { info: jest.Mock; warn: jest.Mock; error: jest.Mock };

  beforeEach(async () => {
    mockJob = {
      unique: jest.fn(),
      schedule: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockAgenda = {
      define: jest.fn(),
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockReturnValue(mockJob),
      cancel: jest.fn().mockResolvedValue(undefined),
    };
    mockEmailService = {
      sendBirthdayGreeting: jest.fn().mockResolvedValue(undefined),
    };
    mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthdayService,
        { provide: AGENDA_TOKEN, useValue: mockAgenda },
        { provide: EmailService, useValue: mockEmailService },
        {
          provide: getLoggerToken(BirthdayService.name),
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get(BirthdayService);
  });

  describe('onModuleInit', () => {
    it('defines the birthday job and starts the scheduler', async () => {
      await service.onModuleInit();

      expect(mockAgenda.define).toHaveBeenCalledWith(
        BIRTHDAY_JOB_NAME,
        expect.any(Function),
        expect.objectContaining({ removeOnComplete: true }),
      );
      expect(mockAgenda.start).toHaveBeenCalled();
    });
  });

  describe('onApplicationShutdown', () => {
    it('stops the scheduler', async () => {
      await service.onApplicationShutdown();

      expect(mockAgenda.stop).toHaveBeenCalled();
    });
  });

  describe('schedule', () => {
    it('creates a job with the correct name and data', async () => {
      await service.schedule(mockJobData);

      expect(mockAgenda.create).toHaveBeenCalledWith(
        BIRTHDAY_JOB_NAME,
        mockJobData,
      );
    });

    it('calls job.unique with the userId key for atomic upsert', async () => {
      await service.schedule(mockJobData);

      expect(mockJob.unique).toHaveBeenCalledWith({
        'data.userId': mockJobData.userId,
      });
    });

    it('saves the job', async () => {
      await service.schedule(mockJobData);

      expect(mockJob.save).toHaveBeenCalled();
    });

    it('schedules the job at a future date', async () => {
      await service.schedule(mockJobData);

      const scheduledAt: Date = mockJob.schedule.mock.calls[0][0] as Date;
      expect(scheduledAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("schedules at 9 AM in the user's local timezone", async () => {
      await service.schedule(mockJobData);

      const scheduledAt: Date = mockJob.schedule.mock.calls[0][0] as Date;
      const localTime = DateTime.fromJSDate(scheduledAt, {
        zone: mockJobData.timezone,
      });
      expect(localTime.hour).toBe(9);
      expect(localTime.minute).toBe(0);
    });
  });

  describe('cancel', () => {
    it('cancels the birthday job for the given user', async () => {
      await service.cancel(mockJobData.userId);

      expect(mockAgenda.cancel).toHaveBeenCalledWith({
        data: { userId: mockJobData.userId },
      });
    });
  });

  describe('job handler (self-reschedule)', () => {
    async function getJobCallback(): Promise<
      (job: { attrs: { data: BirthdayJobData } }) => Promise<void>
    > {
      await service.onModuleInit();
      const [, jobCallback] = mockAgenda.define.mock.calls[0] as [
        string,
        (job: { attrs: { data: BirthdayJobData } }) => Promise<void>,
        unknown,
      ];
      return jobCallback;
    }

    it('sends a birthday greeting and reschedules for next year', async () => {
      const jobCallback = await getJobCallback();

      await jobCallback({ attrs: { data: mockJobData } });

      expect(mockEmailService.sendBirthdayGreeting).toHaveBeenCalledWith(
        mockJobData.name,
        mockJobData.email,
      );
      expect(mockAgenda.create).toHaveBeenCalledWith(
        BIRTHDAY_JOB_NAME,
        mockJobData,
      );
      expect(mockJob.unique).toHaveBeenCalledWith({
        'data.userId': mockJobData.userId,
      });
      expect(mockJob.save).toHaveBeenCalled();
    });

    it('still reschedules even when sendBirthdayGreeting throws', async () => {
      mockEmailService.sendBirthdayGreeting.mockRejectedValue(
        new Error('SMTP connection refused'),
      );

      const jobCallback = await getJobCallback();
      await jobCallback({ attrs: { data: mockJobData } });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockJobData.userId }),
        'Birthday email failed',
      );
      expect(mockJob.save).toHaveBeenCalled();
    });
  });
});
