import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { AbstractSchema } from './abstract.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      ret.id = (ret._id as Types.ObjectId).toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class User extends AbstractSchema {
  @Prop({ required: true, trim: true })
  declare name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  declare email: string;

  @Prop({ required: true })
  declare birthday: Date;

  @Prop({ required: true })
  declare timezone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
