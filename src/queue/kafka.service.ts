import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private ready = false;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['localhost:9092'], // Adjust broker address accordingly
      });
      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.ready = true;
      console.log('Kafka producer connected');
    } catch (error) {
      console.error('Error connecting to Kafka', error);
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

  public async sendMessage(topic: string, message: string) {
    await this.checkConnection(); // Ensure connection before sending the message

    if (!this.ready) {
      throw new Error(
        'Kafka producer is not initialized. Call connect() first.',
      );
    }

    await this.producer.send({
      topic: topic,
      messages: [{ value: message }],
    });
    console.log(`Message sent to topic ${topic}: ${message}`);
  }

  async close() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
