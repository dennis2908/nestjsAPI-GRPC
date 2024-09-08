import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../user/user.service';

@Controller('protousers')
export class ProtousersController {
  constructor(private userService: UserService) {}
  
  @GrpcMethod('UserService', 'getUsers')
  async getUsers() {
    let res = await this.userService.findAllUser()
     return {
      users: res,
    };
  }
}
