import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Post,
  Param,
  Inject,
  Res,
  OnModuleInit
} from '@nestjs/common';
import { User } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto, CreateUserDto } from './dto';
import { UserService } from './user.service';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable,lastValueFrom } from 'rxjs';

interface UserGRPCService {
  getAllUser({}): Observable<any>;
  getUserById({}): Observable<any>;

}
interface fileExport{
  filename : string,
  buffer : string
}
interface UserGRPCService2 {
  importUser({}): Promise<any>;
  createUser({}): Promise<any>;
  getFileExport({}): Observable<fileExport>;
}

@Controller('users')
export class UserController implements OnModuleInit {
  private userGRPCService: UserGRPCService;
  private userGRPCService2: UserGRPCService2;
  constructor(@Inject('USERPROTO_PACKAGE') private client: ClientGrpc,@Inject('USERPROTOCLIENT_PACKAGE') private client2: ClientGrpc, private userService: UserService) {}
  onModuleInit() {
    this.userGRPCService = this.client.getService<UserGRPCService>('UserGRPCService');
    this.userGRPCService2 = this.client2.getService<UserGRPCService2>('UserGRPCService2');
  }
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
  // findAll() {
  //   return this.userService.findAllUser();
  // }
  async getProtoUsers() {
    return this.userGRPCService.getAllUser(null);
  }

  @Get('import-xls')
  async importUser() {
    return await this.userGRPCService2.importUser(null)
  }

  @Get('export-xls')
  async exportUser(@Res() res: Promise<Response>) {
    const buffer = await this.userService.exportXLS();
    const fileExport:fileExport = await lastValueFrom(this.userGRPCService2.getFileExport(null));
   
    (await res).header(
      'Content-Disposition',
      'attachment; filename=user-' + fileExport.filename + '.xlsx',
    );
    (await res).type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    (await res).send(buffer);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userGRPCService.getUserById(new Object({id:id}));
  }

  // @UseGuards(JwtGuard)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: EditUserDto) {
  //   return this.userService.updateUser(+id, updateUserDto);
  // }

  // @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userGRPCService2.createUser(createUserDto);
  }

}
