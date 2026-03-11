import { Document } from 'mongoose';
export interface ILog extends Document {
  readonly type: string;
  readonly table: string;
  readonly createdTime: string;
}
