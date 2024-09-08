import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  readonly type: string;
  @IsString()
  @IsNotEmpty()
  readonly table: string;
  @IsString()
  @IsNotEmpty()
  readonly createdTime: string;
}
