import { Test, TestingModule } from '@nestjs/testing';

import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import {
  MOCK_CREATE_USER_DTO,
  MOCK_USER,
  MOCK_USER_ID,
} from './users.fixtures';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<
    Pick<UsersService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    usersService = module.get(UsersService);
  });

  it('create delegates to usersService.create and returns the result', async () => {
    (usersService.create as jest.Mock).mockResolvedValue(MOCK_USER);

    const result = await controller.create(MOCK_CREATE_USER_DTO);

    expect(usersService.create).toHaveBeenCalledWith(MOCK_CREATE_USER_DTO);
    expect(result).toEqual(MOCK_USER);
  });

  it('findAll delegates to usersService.findAll and returns the result', async () => {
    (usersService.findAll as jest.Mock).mockResolvedValue([MOCK_USER]);

    const result = await controller.findAll();

    expect(usersService.findAll).toHaveBeenCalledWith();
    expect(result).toEqual([MOCK_USER]);
  });

  it('findOne delegates to usersService.findOne with the parsed ObjectId', async () => {
    (usersService.findOne as jest.Mock).mockResolvedValue(MOCK_USER);

    const result = await controller.findOne(MOCK_USER_ID);

    expect(usersService.findOne).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(result).toEqual(MOCK_USER);
  });

  it('update delegates to usersService.update with the parsed ObjectId and dto', async () => {
    const dto: UpdateUserDto = { timezone: 'UTC' };
    (usersService.update as jest.Mock).mockResolvedValue(MOCK_USER);

    const result = await controller.update(MOCK_USER_ID, dto);

    expect(usersService.update).toHaveBeenCalledWith(MOCK_USER_ID, dto);
    expect(result).toEqual(MOCK_USER);
  });

  it('remove delegates to usersService.remove with the parsed ObjectId', async () => {
    (usersService.remove as jest.Mock).mockResolvedValue(MOCK_USER);

    const result = await controller.remove(MOCK_USER_ID);

    expect(usersService.remove).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(result).toEqual(MOCK_USER);
  });
});
