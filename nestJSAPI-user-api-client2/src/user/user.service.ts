import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { UserEntity } from './entities/user.entity';
import { EmailService } from '../email/email.service';
import { ProducerService } from 'src/queues/producer.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PusherService } from 'src/pusher/pusher.service';
import { Pusher } from 'src/pusher/pusher';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLogDto } from 'src/mongo/create-log.dto';
import { Model } from 'mongoose';
import { ILog } from 'src/mongo/mongo.interface';

import * as ExcelJS from 'exceljs';
import { table } from 'console';

@Injectable()
export class UserService {
  /**
   * Here, we have used data mapper approch for this tutorial that is why we
   * injecting repository here. Another approch can be Active records.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private emailService: EmailService,
    private pusherService: PusherService,
    private producerService: ProducerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel('Log') private logModel: Model<ILog>,
  ) {}

  /**
   * this is function is used to create User in User Entity.
   * @param EditUserDto this will type of createUserDto in which
   * we have defined what are the keys we are expecting from body
   * @returns promise of user
   */

  async importXLS() {
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile('upload/user-4-6-2024-11-31-40.xlsx');
    const workbook_sheet = workbook.SheetNames;
    let workbook_response = xlsx.utils.sheet_to_json(
      // Step 4
      workbook.Sheets[workbook_sheet[0]],
    );
    for (let i = 0; i < workbook_response.length; i++) {
      console.log(workbook_response[0]);
      await this.createUser({
        email: workbook_response[i].Email,
        firstName: workbook_response[i]['First Name'],
        lastName: workbook_response[i]['Last Name'],
        username: workbook_response[i]['User Name'],
      });
    }
  }

  async exportXLS(): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('TestExportXLS');

    let data = this.userRepository.find();

    worksheet.columns = [
      { header: 'No', key: 'no' },
      { header: 'Email', key: 'email' },
      { header: 'First Name', key: 'firstName' },
      { header: 'Last Name', key: 'lastName' },
      { header: 'User Name', key: 'username' },
    ];
    let i = 1;
    (await data).forEach((value) => {
      worksheet.addRow({
        no: i++,
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName,
        username: value.username,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async nowDate(): Promise<string> {
    var d = new Date();

    return (
      d.getDate() +
      '-' +
      d.getMonth() +
      '-' +
      d.getFullYear() +
      '-' +
      d.getHours() +
      '-' +
      d.getMinutes() +
      '-' +
      d.getSeconds()
    );
  }

  randomStringAsBase64Url(size): string {
    const crypto = require('crypto');
    return crypto.randomBytes(size).toString('base64url');
  }

  async createUser(CreateUserDto: CreateUserDto): Promise<UserEntity> {
    console.log(CreateUserDto);
    const emailData = {
      email: CreateUserDto.email,
      subject: 'Welcome to Our Community',
      html: `<p>Hello ${CreateUserDto.username},</p>
      <p>Welcome to our community! Your account is now active.</p>
      <p>Enjoy your time with us!</p>`,
    };
    await this.producerService.addToEmailQueue(emailData);

    const user: UserEntity = new UserEntity();
    user.lastName = CreateUserDto.lastName;
    user.email = CreateUserDto.email;
    user.firstName = CreateUserDto.firstName;
    user.username = CreateUserDto.username;

    let notify = new Pusher('upload_data');

    this.pusherService.create(notify);
    await this.createLog({
      type: 'save operation',
      table: 'user',
      createdTime: await this.nowDate(),
    });
    return await this.userRepository.save(user);
  }

  async createLog(createLogtDto: CreateLogDto): Promise<ILog> {
    const newLog = new this.logModel(createLogtDto);
    return newLog.save();
  }

  /**
   * this function is used to get all the user's list
   * @returns promise of array of users
   */
  async findAllUser(): Promise<UserEntity[]> {
    const data = await this.userRepository.find();
    const token = this.randomStringAsBase64Url(32);
    await this.cacheManager.set(token, JSON.stringify(data));
    const value = await this.cacheManager.get(token);
    console.log(value);
    return data;
  }

  /**
   * this function used to get data of use whose id is passed in parameter
   * @param id is type of number, which represent the id of user.
   * @returns promise of user
   */
  async viewUser(id: number): Promise<UserEntity> {
    const data = await this.userRepository.findOneBy({ id });
    const token = this.randomStringAsBase64Url(32);
    await this.cacheManager.set(token, JSON.stringify(data));
    const value = await this.cacheManager.get(token);
    console.log(value);
    return this.userRepository.findOneBy({ id });
  }

  /**
   * this function is used to updated specific user whose id is passed in
   * parameter along with passed updated data
   * @param id is type of number, which represent the id of user.
   * @param updateUserDto this is partial type of createUserDto.
   * @returns promise of udpate user
   */

  /**
   * this function is used to remove or delete user from database.
   * @param id is the type of number, which represent id of user
   * @returns nuber of rows deleted or affected
   */
  removeBUser(id: number): Promise<{ affected?: number }> {
    return this.userRepository.delete(id);
  }
}
