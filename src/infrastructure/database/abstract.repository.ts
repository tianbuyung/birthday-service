import { NotFoundException } from '@nestjs/common';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { AbstractSchema } from './schemas/abstract.schema';

export abstract class AbstractRepository<T extends AbstractSchema> {
  protected abstract readonly logger: PinoLogger;

  constructor(public readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createdDocument.save()).toJSON();
  }

  async find(queryFilter: QueryFilter<T>): Promise<T[]> {
    const documents = await this.model.find(queryFilter);
    return documents.map((doc) => doc.toJSON() as T);
  }

  async findOne(queryFilter: QueryFilter<T>): Promise<T> {
    const document = await this.model.findOne(queryFilter);

    if (!document) {
      this.logger.warn({ queryFilter }, 'Document not found');
      throw new NotFoundException('Document not found.');
    }

    return document.toJSON();
  }

  async findOneAndUpdate(
    queryFilter: QueryFilter<T>,
    update: UpdateQuery<T>,
  ): Promise<T> {
    const document = await this.model.findOneAndUpdate(queryFilter, update, {
      new: true,
    });

    if (!document) {
      this.logger.warn({ queryFilter }, 'Document not found');
      throw new NotFoundException('Document not found.');
    }

    return document.toJSON();
  }

  async findOneAndDelete(queryFilter: QueryFilter<T>): Promise<T> {
    const document = await this.model.findOneAndDelete(queryFilter);

    if (!document) {
      this.logger.warn({ queryFilter }, 'Document not found');
      throw new NotFoundException('Document not found.');
    }

    return document.toJSON();
  }
}
