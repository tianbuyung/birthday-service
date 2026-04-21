import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { AbstractRepository } from '@/infrastructure/database/abstract.repository';
import {
  User,
  UserDocument,
} from '@/infrastructure/database/schemas/user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  constructor(
    @InjectModel(User.name) model: Model<UserDocument>,
    @InjectPinoLogger(UserRepository.name)
    protected readonly logger: PinoLogger,
  ) {
    super(model);
  }
}
