import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { EmailModule } from '../email/email.module';
import { EmailService } from 'src/email/email.service';
import { ProducerService } from 'src/queues/producer.service';
import { ConsumerService } from 'src/queues/consumer.service';
import { PusherService } from 'src/pusher/pusher.service';
import { RedisOptions } from 'src/configs/app-options.constants';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { LogSchema } from 'src/mongo/mongo.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERPROTO_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50052',
          package: 'userproto',
          protoPath: join(__dirname, '../../../proto/user/user.proto'),
        },
      },
      {
        name: 'USERPROTOCLIENT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50053',
          package: 'userproto',
          protoPath: join(__dirname, '../../../proto/user/user.proto'),
        },
      }
    ]),
    TypeOrmModule.forFeature([UserEntity]),
    EmailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisOptions),
    MongooseModule.forFeature([{ name: 'Log', schema: LogSchema }]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    EmailService,
    ProducerService,
    ConsumerService,
    PusherService,
  ],
  exports: [EmailService],
})
export class UserModule {}
