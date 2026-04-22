import { Types } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';

export const MOCK_USER_ID = new Types.ObjectId('6634a1f2e4b0c123456789ab');

export const MOCK_USER = {
  id: MOCK_USER_ID.toString(),
  name: 'John Doe',
  email: 'john@example.com',
  birthday: new Date('1990-04-21T00:00:00.000Z'),
  timezone: 'Asia/Jakarta',
  createdAt: new Date('2025-04-21T00:00:00.000Z'),
  updatedAt: new Date('2025-04-21T00:00:00.000Z'),
};

export const MOCK_CREATE_USER_DTO: CreateUserDto = {
  name: MOCK_USER.name,
  email: MOCK_USER.email,
  birthday: '1990-04-21',
  timezone: MOCK_USER.timezone,
};
