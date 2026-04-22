import { Test, TestingModule } from '@nestjs/testing';

import { appConfig } from '@/config/app.config';

import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockConfig = { protocol: 'http', host: 'localhost', port: 3002 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        { provide: appConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get(AppConfigService);
  });

  it('server getter returns the injected config', () => {
    expect(service.server).toEqual(mockConfig);
  });
});
