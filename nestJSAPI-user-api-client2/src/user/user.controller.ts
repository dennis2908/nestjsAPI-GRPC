import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Post,
  Param,
  Res,
} from '@nestjs/common';
import { User } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto, CreateUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(AuthGuard('jwt')) // This is inbuilt guard given by passport
  @UseGuards(JwtGuard) // This is the custom guard
  @Get('me')
  // getMe(@Req() req: Request) { // This is inbuilt decorator @Req() to get Request data
  // req.user contain the data which is inside the token
  // console.log({ user: req.user });

  // getMe(@GetUser() user: User, @GetUser('email') email: string) { // If you want specific field or both like full response in 1 variable and specific field in separate variable
  // console.log(email);
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get()
  findAll() {
    return this.userService.findAllUser();
  }

  @Get('import-xls')
  async importXLS(@Res() res: Response) {
    await this.userService.importXLS();
    res.send('successfully import data');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.viewUser(+id);
  }

  // @UseGuards(JwtGuard)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: EditUserDto) {
  //   return this.userService.updateUser(+id, updateUserDto);
  // }

  // @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get('xls')
  async exportXLS(@Res() res: Response) {
    const buffer = await this.userService.exportXLS();
    const filename = await this.userService.nowDate();
    res.header(
      'Content-Disposition',
      'attachment; filename=user-' + filename + '.xlsx',
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }
}
