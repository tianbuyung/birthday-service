import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BirthdayModule } from '@/api/birthday/birthday.module';
import {
  User,
  UserSchema,
} from '@/infrastructure/database/schemas/user.schema';

import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BirthdayModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
