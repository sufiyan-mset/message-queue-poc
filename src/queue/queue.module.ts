import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { QueueConfigService } from '../config/queue.config';
import { RabbitMQService } from './rabbitmq.service';
import { AzureServiceBusService } from './azure.service-bus.service';
import { PubSubService } from './pubsub.service';
import { KafkaService } from './kafka.service';

@Module({
  imports: [],
  providers: [
    QueueConfigService,
    RabbitMQService,
    KafkaService,
    AzureServiceBusService,
    PubSubService,
  ],
  exports: [QueueConfigService],
})
export class QueueModule {}
