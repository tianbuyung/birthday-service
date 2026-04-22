import { ConflictException } from '@nestjs/common';
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

describe('UserSchema post-save error handler', () => {
  type KareemHook = {
    fn: (error: Error, doc: unknown, next: (err?: Error) => void) => void;
  };
  type SchemaInternals = {
    s: { hooks: { _posts: Map<string, KareemHook[]> } };
  };

  const getErrorHook = () => {
    const posts = (UserSchema as unknown as SchemaInternals).s.hooks._posts;
    const saveHooks = posts.get('save') ?? [];
    const hook = saveHooks.find((h) => h.fn.length === 3);
    return hook!.fn;
  };

  it('converts MongoServerError code 11000 to ConflictException', () => {
    const hook = getErrorHook();
    const mongoError = Object.assign(new Error('E11000'), { code: 11000 });
    const next = jest.fn();

    hook(mongoError, null, next);

    expect(next).toHaveBeenCalledWith(expect.any(ConflictException));
    const conflict = next.mock.calls[0][0] as ConflictException;
    expect(conflict.getStatus()).toBe(409);
  });

  it('passes other errors through unchanged', () => {
    const hook = getErrorHook();
    const otherError = new Error('something else');
    const next = jest.fn();

    hook(otherError, null, next);

    expect(next).toHaveBeenCalledWith(otherError);
  });
});
