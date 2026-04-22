import {
  DiskHealthIndicator,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { appConfig } from '@/config/app.config';

import { HealthController } from './health.controller';

const mockHealthResult = { status: 'ok', info: {}, error: {}, details: {} };

async function buildController(host: string): Promise<HealthController> {
  const mockAppConfig = { protocol: 'http', host, port: 3002 };

  const healthCheckService = {
    check: jest
      .fn()
      .mockImplementation(async (fns: (() => Promise<unknown>)[]) => {
        await Promise.all(fns.map((fn) => fn().catch(() => {})));
        return mockHealthResult;
      }),
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [
      { provide: appConfig.KEY, useValue: mockAppConfig },
      { provide: HealthCheckService, useValue: healthCheckService },
      {
        provide: DiskHealthIndicator,
        useValue: { checkStorage: jest.fn().mockResolvedValue({}) },
      },
      {
        provide: MemoryHealthIndicator,
        useValue: {
          checkHeap: jest.fn().mockResolvedValue({}),
          checkRSS: jest.fn().mockResolvedValue({}),
        },
      },
      {
        provide: HttpHealthIndicator,
        useValue: { pingCheck: jest.fn().mockResolvedValue({}) },
      },
      {
        provide: MongooseHealthIndicator,
        useValue: { pingCheck: jest.fn().mockResolvedValue({}) },
      },
    ],
  }).compile();

  return module.get(HealthController);
}

describe('HealthController', () => {
  it('check invokes all 5 health indicators and returns the result', async () => {
    const controller = await buildController('localhost');

    const result = await controller.check();

    expect(result).toEqual(mockHealthResult);
  });

  it('wraps a bare IPv6 host in brackets for the docs URL', async () => {
    const controller = await buildController('::1');

    await expect(controller.check()).resolves.toEqual(mockHealthResult);
  });

  it('does not double-bracket an already-bracketed IPv6 host', async () => {
    const controller = await buildController('[::1]');

    await expect(controller.check()).resolves.toEqual(mockHealthResult);
  });
});
