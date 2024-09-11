import { Module } from '@nestjs/common';
import { ProtousersController } from './protousers.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    EmailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisOptions),
    MongooseModule.forFeature([{ name: 'Log', schema: LogSchema }]),
  ],
  controllers: [ProtousersController],
  providers: [
    UserService,
    UserService,
    EmailService,
    ProducerService,
    ConsumerService,
    PusherService,
  ],
  exports: [UserService],
})
export class ProtousersModule {}
