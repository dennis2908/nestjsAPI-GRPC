import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { EmailService } from 'src/email/email.service';

import { Queue, Worker } from 'bullmq';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  constructor(private emailService: EmailService) {
    const connection = amqp.connect(['amqp://localhost']);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue('emailQueue', { durable: true });
        channel.prefetch(1);
        await channel.consume(
          'emailQueue',
          async (message) => {
            if (message) {
              const content = JSON.parse(message.content.toString());
              this.logger.log('Received message:', content);
              await this.emailService.sendEmail(content);

              const redisOptions = { host: 'localhost', port: 6379 };

              const EmailUser = new Queue('EmailUser', {
                connection: redisOptions,
              });

              const job = await EmailUser.add('EmailUser', content, {
                delay: 2000,
              });
              const worker = new Worker(
                'EmailUser',
                async (data) => {
                  await this.emailService.sendEmail(data.data);
                },
                { connection: redisOptions },
              );

              worker.on('completed', (job) => {
                console.log(`Job ${job.id} completed successfully`);
              });

              worker.on('failed', (job, err) => {
                console.error(`Job ${job.id} failed with error ${err.message}`);
              });
              channel.ack(message);
            }
          },
          { noAck: false },
        );
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}
