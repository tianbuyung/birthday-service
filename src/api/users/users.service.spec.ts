import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BirthdayService } from '../birthday/birthday.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import {
  MOCK_CREATE_USER_DTO,
  MOCK_USER,
  MOCK_USER_ID,
} from './users.fixtures';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<
    Pick<
      UserRepository,
      'create' | 'find' | 'findOne' | 'findOneAndUpdate' | 'findOneAndDelete'
    >
  >;
  let birthdayService: jest.Mocked<
    Pick<BirthdayService, 'schedule' | 'cancel'>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
        {
          provide: BirthdayService,
          useValue: {
            schedule: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepository = module.get(UserRepository);
    birthdayService = module.get(BirthdayService);
  });

  describe('create', () => {
    it('persists the user and schedules a birthday job', async () => {
      (userRepository.create as jest.Mock).mockResolvedValue(MOCK_USER);
      (birthdayService.schedule as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create(MOCK_CREATE_USER_DTO);

      expect(userRepository.create).toHaveBeenCalledWith({
        name: MOCK_CREATE_USER_DTO.name,
        email: MOCK_CREATE_USER_DTO.email,
        birthday: new Date(MOCK_CREATE_USER_DTO.birthday),
        timezone: MOCK_CREATE_USER_DTO.timezone,
      });
      expect(birthdayService.schedule).toHaveBeenCalledWith({
        userId: MOCK_USER.id,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        birthday: MOCK_USER.birthday.toISOString(),
        timezone: MOCK_USER.timezone,
      });
      expect(result).toEqual(MOCK_USER);
    });
  });

  describe('findAll', () => {
    it('returns all users from the repository', async () => {
      (userRepository.find as jest.Mock).mockResolvedValue([MOCK_USER]);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual([MOCK_USER]);
    });

    it('returns an empty array when no users exist', async () => {
      (userRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the user matching the given id', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(MOCK_USER);

      const result = await service.findOne(MOCK_USER_ID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        _id: MOCK_USER_ID,
      });
      expect(result).toEqual(MOCK_USER);
    });

    it('propagates NotFoundException when the user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.findOne(MOCK_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates the user and reschedules the birthday job', async () => {
      const dto: UpdateUserDto = { timezone: 'America/New_York' };
      (userRepository.findOneAndUpdate as jest.Mock).mockResolvedValue(
        MOCK_USER,
      );

      const result = await service.update(MOCK_USER_ID, dto);

      expect(userRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: MOCK_USER_ID },
        { $set: { timezone: 'America/New_York' } },
      );
      expect(birthdayService.schedule).toHaveBeenCalledWith(
        expect.objectContaining({ userId: MOCK_USER_ID.toString() }),
      );
      expect(result).toEqual(MOCK_USER);
    });

    it('converts birthday string to Date in $set when birthday is provided', async () => {
      const dto: UpdateUserDto = { birthday: '1990-06-15' };
      (userRepository.findOneAndUpdate as jest.Mock).mockResolvedValue(
        MOCK_USER,
      );

      await service.update(MOCK_USER_ID, dto);

      expect(userRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: MOCK_USER_ID },
        { $set: { birthday: new Date('1990-06-15') } },
      );
    });

    it('propagates NotFoundException when the user does not exist', async () => {
      (userRepository.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.update(MOCK_USER_ID, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the user and cancels the birthday job', async () => {
      (userRepository.findOneAndDelete as jest.Mock).mockResolvedValue(
        MOCK_USER,
      );

      const result = await service.remove(MOCK_USER_ID);

      expect(userRepository.findOneAndDelete).toHaveBeenCalledWith({
        _id: MOCK_USER_ID,
      });
      expect(birthdayService.cancel).toHaveBeenCalledWith(
        MOCK_USER_ID.toString(),
      );
      expect(result).toEqual(MOCK_USER);
    });

    it('propagates NotFoundException when the user does not exist', async () => {
      (userRepository.findOneAndDelete as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.remove(MOCK_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
