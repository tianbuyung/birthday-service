import { Types } from 'mongoose';

import { UserSchema } from './user.schema';

describe('UserSchema toJSON transform', () => {
  const transform = UserSchema.options.toJSON?.transform as (
    _: unknown,
    ret: Record<string, unknown>,
  ) => Record<string, unknown>;

  it('maps _id to id string and removes __v', () => {
    const id = new Types.ObjectId();
    const ret: Record<string, unknown> = { _id: id, __v: 0, name: 'Alice' };

    const result = transform(null, ret);

    expect(result.id).toBe(id.toString());
    expect(result._id).toBeUndefined();
    expect(result.__v).toBeUndefined();
    expect(result.name).toBe('Alice');
  });
});
