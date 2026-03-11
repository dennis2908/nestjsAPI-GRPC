import { Controller, OnModuleInit, Inject, Get } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface UserGRPCService {
  getAllUser({}): Observable<any>;
  getUserById({}): Observable<any>;
}

@Controller('protousers')
export class ProtousersController implements OnModuleInit {
  private userGRPCService: UserGRPCService;

  constructor(@Inject('USERPROTO_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.userGRPCService = this.client.getService<UserGRPCService>('UserGRPCService');
  }

  @Get()
  async getProtoUsers() {
    return this.userGRPCService.getAllUser(null);
  }
}
