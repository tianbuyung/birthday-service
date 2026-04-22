import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  let pipe: ParseObjectIdPipe;

  beforeEach(() => {
    pipe = new ParseObjectIdPipe();
  });

  it('returns a Types.ObjectId for a valid 24-char hex string', () => {
    const id = '6634a1f2e4b0c123456789ab';

    const result = pipe.transform(id);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result.toString()).toBe(id);
  });

  it('throws BadRequestException for an invalid id', () => {
    expect(() => pipe.transform('not-valid')).toThrow(BadRequestException);
    expect(() => pipe.transform('not-valid')).toThrow('Invalid id: not-valid');
  });
});
