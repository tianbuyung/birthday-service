import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { User } from '@/infrastructure/database/schemas/user.schema';

import { BirthdayJobData, BirthdayService } from '../birthday/birthday.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly birthdayService: BirthdayService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create({
      ...dto,
      birthday: new Date(dto.birthday),
    });

    await this.birthdayService.schedule(this.toJobData(user.id, user));

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({});
  }

  async findOne(id: Types.ObjectId): Promise<User> {
    return this.userRepository.findOne({ _id: id });
  }

  async update(id: Types.ObjectId, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...dto,
          ...(dto.birthday && { birthday: new Date(dto.birthday) }),
        },
      },
    );

    await this.birthdayService.schedule(this.toJobData(id.toString(), user));

    return user;
  }

  async remove(id: Types.ObjectId): Promise<User> {
    const user = await this.userRepository.findOneAndDelete({ _id: id });
    await this.birthdayService.cancel(id.toString());
    return user;
  }

  private toJobData(userId: string, user: User): BirthdayJobData {
    return {
      userId,
      name: user.name,
      email: user.email,
      birthday: user.birthday.toISOString(),
      timezone: user.timezone,
    };
  }
}
