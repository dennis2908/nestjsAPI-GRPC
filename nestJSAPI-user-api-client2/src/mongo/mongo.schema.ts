import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Log {
  @Prop()
  type: string;
  @Prop()
  table: string;
  @Prop()
  createdTime: string;
}
export const LogSchema = SchemaFactory.createForClass(Log);
