import { Controller,Param } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../user/user.service';

interface fileExport{
  filename : string,
  buffer : string
}
@Controller('protousers')
export class ProtousersController {
  constructor(private userService: UserService) {}
  

  @GrpcMethod('UserGRPCService2', 'createUser')
  async createUser(
    UserPost:
    { 
      firstName:string;
      lastName : string;
      email : string;
      username : string;
    }) 
  {
     await this.userService.createUser(UserPost)
    return {response : "successfully save data"};
  }
  
  @GrpcMethod('UserGRPCService2', 'importUser')
  async importUser() {
    await this.userService.importXLS();
     return {response : "successfully import data"};
  }

  @GrpcMethod('UserGRPCService2', 'getFileExport')
  async fileExport({}:Promise<fileExport>) {
    const filename = await this.userService.nowDate();
    return {filename : filename };
  }
}
