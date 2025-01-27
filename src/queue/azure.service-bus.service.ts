import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AzureServiceBusService implements OnModuleInit, OnModuleDestroy {
  private serviceBusClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private ready = false;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING; // connection string from devOps
      const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME; // Azure connection string from devOps

      if (!connectionString || !queueName) {
        throw new Error(
          'Azure Service Bus connection string or queue name is not defined in the environment variables.',
        );
      }

      this.serviceBusClient = new ServiceBusClient(connectionString);
      this.sender = this.serviceBusClient.createSender(queueName);
      this.ready = true;
      console.log('Azure Service Bus sender connected');
    } catch (error) {
      console.error('Error connecting to Azure Service Bus', error);
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

  public async sendMessage(useless: string, message: any) {
    await this.checkConnection(); // checking if connection string is failing or working fine

    if (!this.ready) {
      throw new Error(
        'Azure Service Bus sender is not initialized. Call connect() first.',
      );
    }
    const now = new Date();
    await this.sender.sendMessages({
      body: message,
      timeToLive: 300000,
      scheduledEnqueueTimeUtc: new Date(now.getTime() + 60 * 1000),
    });
    console.log(`Message sent: ${message}`);
  }

  async close() {
    if (this.sender) {
      await this.sender.close();
    }
    if (this.serviceBusClient) {
      await this.serviceBusClient.close();
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
