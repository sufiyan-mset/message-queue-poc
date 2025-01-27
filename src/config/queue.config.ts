import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../queue/rabbitmq.service';
import { KafkaService } from 'src/queue/kafka.service';
import { AzureServiceBusService } from '../queue/azure.service-bus.service';
// import { PubSubService } from '../queue/pubsub.service';

@Injectable()
export class QueueConfigService {
  constructor() {}

  getQueueProvider() {
    const provider = 'azure';
    switch (provider) {
      // case 'rabbitmq':
      //   return new RabbitMQService();
      // case 'kafka':
      //   return new KafkaService();
      case 'azure':
        return new AzureServiceBusService();
      //   case 'pubsub':
      //     return new PubSubService();
      default:
        throw new Error('Invalid queue provider');
    }
  }
}
