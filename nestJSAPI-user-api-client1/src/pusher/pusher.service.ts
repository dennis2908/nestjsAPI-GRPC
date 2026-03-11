import { Pusher } from './pusher';
require('dotenv').config({ path: '.env' });

import { Injectable } from '@nestjs/common';

@Injectable()
export class PusherService {
  create(notify: Pusher) {
    const Pusher = require('pusher');

    var pusher = new Pusher({
      appId: process.env.pusher_appId,
      key: process.env.pusher_key,
      secret: process.env.pusher_secret,
      cluster: process.env.pusher_cluster,
      useTLS: true,
    });

    pusher.trigger('notification', 'toFE', notify);
  }
}
