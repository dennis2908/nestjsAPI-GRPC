import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
