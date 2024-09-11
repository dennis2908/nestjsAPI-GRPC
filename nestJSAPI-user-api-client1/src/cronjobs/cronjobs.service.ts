import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronjobsService {
  @Cron('0 * * * * *')
  openForBusiness() {
    console.log('Delicious cakes is open for business...');
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  takingOrders() {
    console.log('Delicious cakes is still taking orders');
  }

  // new
  @Cron('40,45 * * * * *')
  closingSoon() {
    console.log('Delicious cakes will be closing soon');
  }
}
