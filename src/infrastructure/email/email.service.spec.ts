import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';

import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockLogger: { info: jest.Mock };

  beforeEach(async () => {
    mockLogger = { info: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: getLoggerToken(EmailService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get(EmailService);
  });

  it('logs the birthday greeting and prints to console', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await service.sendBirthdayGreeting('Jane Doe', 'jane@example.com');

    expect(mockLogger.info).toHaveBeenCalledWith(
      { email: 'jane@example.com' },
      'Happy Birthday, Jane Doe!',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Jane Doe'),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('jane@example.com'),
    );
  });
});
