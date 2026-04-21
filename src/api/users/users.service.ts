import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { User } from '@/infrastructure/database/schemas/user.schema';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.userRepository.create({
      ...dto,
      birthday: new Date(dto.birthday),
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({});
  }

  async findOne(id: Types.ObjectId): Promise<User> {
    return this.userRepository.findOne({ _id: id });
  }

  async update(id: Types.ObjectId, dto: UpdateUserDto): Promise<User> {
    return this.userRepository.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...dto,
          ...(dto.birthday && { birthday: new Date(dto.birthday) }),
        },
      },
    );
  }

  async remove(id: Types.ObjectId): Promise<User> {
    return this.userRepository.findOneAndDelete({ _id: id });
  }
}
