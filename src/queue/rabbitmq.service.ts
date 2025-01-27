import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private ready = false;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect('amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
      this.ready = true;
      console.log('RabbitMQ connection and channel established');
    } catch (error) {
      console.error('Error connecting to RabbitMQ', error);
    }
  }

  private async checkConnection() {
    if (!this.ready) {
      console.log('Connection lost. Reconnecting...');
      await this.reconnect();
    }
  }

  private async reconnect() {
    try {
      await this.connect();
    } catch (error) {
      console.error('Reconnection failed', error);
    }
  }

  public async sendMessage(
    queue: string,
    message: any,
    options?: { priority?: boolean },
  ) {
    await this.checkConnection(); // Ensure connection before sending the message

    if (!this.ready) {
      throw new Error('RabbitMQ channel is not initialized.');
    }

    //For delay we used exchange
    const exchange = 'delayed_exchange';
    await this.channel.assertExchange(exchange, 'x-delayed-message', {
      arguments: {
        'x-delayed-type': 'direct',
      },
    });

    // Implementing Priority
    const queueOptions = options?.priority
      ? { durable: false, arguments: { 'x-max-priority': 10 } } // Set max priority to 10
      : { durable: false };

    await this.channel.assertQueue(queue, queueOptions);

    //for exchange we will not use sendToQueue
    // this.channel.sendToQueue(queue, Buffer.from(message));

    // and we will use bind and publish for exchange

    await this.channel.bindQueue(queue, exchange, '');

    // Serialize the message if it's an object
    const messageContent =
      typeof message === 'string' ? message : JSON.stringify(message);

    // Publish the message with priority if enabled
    const publishOptions: amqp.Options.Publish = {
      headers: { 'x-delay': message.delay || 0 }, // Delay if provided
      ...(options?.priority && message.priority
        ? { priority: message.priority }
        : {}),
      expiration: 5000,
    };

    this.channel.publish(
      exchange,
      '',
      Buffer.from(messageContent),
      publishOptions,
    );
    console.log(`Message sent to queue ${queue}: ${messageContent}`);
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
