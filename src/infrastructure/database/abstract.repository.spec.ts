import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { AbstractRepository } from './abstract.repository';
import { DOCUMENT_NOT_FOUND_MSG } from './database.constants';
import { AbstractSchema } from './schemas/abstract.schema';

// Plain object — `warn` is an own property, not a class prototype method
const mockLogger: { warn: jest.Mock } = { warn: jest.fn() };

class TestRepository extends AbstractRepository<AbstractSchema> {
  protected readonly logger = mockLogger as unknown as PinoLogger;
}

describe('AbstractRepository', () => {
  let repo: TestRepository;
  let mockFind: jest.Mock;
  let mockFindOne: jest.Mock;
  let mockFindOneAndUpdate: jest.Mock;
  let mockFindOneAndDelete: jest.Mock;
  let mockSave: jest.Mock;

  const mockId = new Types.ObjectId();
  const mockData = { _id: mockId, name: 'Test' };
  const toJSON = jest.fn().mockReturnValue(mockData);
  const mockDoc = { toJSON };

  beforeEach(() => {
    mockFind = jest.fn();
    mockFindOne = jest.fn();
    mockFindOneAndUpdate = jest.fn();
    mockFindOneAndDelete = jest.fn();
    mockSave = jest.fn().mockResolvedValue(mockDoc);

    const mockModel = Object.assign(
      jest.fn().mockImplementation(() => ({ save: mockSave })),
      {
        find: mockFind,
        findOne: mockFindOne,
        findOneAndUpdate: mockFindOneAndUpdate,
        findOneAndDelete: mockFindOneAndDelete,
      },
    );

    repo = new TestRepository(mockModel as unknown as Model<AbstractSchema>);
  });

  describe('create', () => {
    it('creates a document with a generated _id and returns the toJSON result', async () => {
      const result = await repo.create({ name: 'Test' });

      expect(result).toEqual(mockData);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('returns all matched documents mapped through toJSON', async () => {
      const docs = [
        { toJSON: () => ({ id: '1' }) },
        { toJSON: () => ({ id: '2' }) },
      ];
      mockFind.mockResolvedValue(docs);

      const result = await repo.find({});

      expect(mockFind).toHaveBeenCalledWith({});
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('findOne', () => {
    it('returns the document when found', async () => {
      mockFindOne.mockResolvedValue(mockDoc);

      const result = await repo.findOne({ _id: mockId });

      expect(mockFindOne).toHaveBeenCalledWith({ _id: mockId });
      expect(result).toEqual(mockData);
    });

    it('throws NotFoundException and logs a warning when not found', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(repo.findOne({ _id: mockId })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { queryFilter: { _id: mockId } },
        DOCUMENT_NOT_FOUND_MSG,
      );
    });
  });

  describe('findOneAndUpdate', () => {
    it('returns the updated document', async () => {
      mockFindOneAndUpdate.mockResolvedValue(mockDoc);

      const result = await repo.findOneAndUpdate(
        { _id: mockId },
        { $set: { name: 'Updated' } },
      );

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId },
        { $set: { name: 'Updated' } },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(mockData);
    });

    it('throws NotFoundException and logs a warning when not found', async () => {
      mockFindOneAndUpdate.mockResolvedValue(null);

      await expect(
        repo.findOneAndUpdate({ _id: mockId }, { $set: { name: 'x' } }),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { queryFilter: { _id: mockId } },
        DOCUMENT_NOT_FOUND_MSG,
      );
    });
  });

  describe('findOneAndDelete', () => {
    it('returns the deleted document', async () => {
      mockFindOneAndDelete.mockResolvedValue(mockDoc);

      const result = await repo.findOneAndDelete({ _id: mockId });

      expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: mockId });
      expect(result).toEqual(mockData);
    });

    it('throws NotFoundException and logs a warning when not found', async () => {
      mockFindOneAndDelete.mockResolvedValue(null);

      await expect(repo.findOneAndDelete({ _id: mockId })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { queryFilter: { _id: mockId } },
        DOCUMENT_NOT_FOUND_MSG,
      );
    });
  });
});
