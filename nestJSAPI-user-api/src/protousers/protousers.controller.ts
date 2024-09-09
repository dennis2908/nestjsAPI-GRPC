import { Controller,Param } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../user/user.service';

@Controller('protousers')
export class ProtousersController {
  constructor(private userService: UserService) {}
  
  @GrpcMethod('UserGRPCService', 'getAllUser')
  async getUsers() {
    let res = await this.userService.findAllUser()
     return {
      users: res,
    };
  }

  @GrpcMethod('UserGRPCService', 'getUserById')
  async findOne(userId:{id: string}) {
   
    let res = await this.userService.viewUser(parseInt(userId.id));
     console.log(121221,{responseCode : 200, users : res})
     return {
      responseCode : 200,
      users : res
    };
  }
}
