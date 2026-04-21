import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId })
  declare _id: Types.ObjectId;
}
