import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';

import { User } from '@/infrastructure/database/schemas/user.schema';

import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getModelToken(User.name), useValue: {} },
        {
          provide: getLoggerToken(UserRepository.name),
          useValue: { warn: jest.fn() },
        },
      ],
    }).compile();

    repository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
