import { Body, Controller, Get } from '@nestjs/common';
import { QueueConfigService } from './config/queue.config';
import { MessageValidator } from './utils/message-validator';

@Controller()
export class AppController {
  constructor(private readonly queueConfigService: QueueConfigService) {}

  @Get('health-check')
  async healthCheck() {
    return 'checking health';
  }

  @Get('send-message')
  async sendMessage(@Body() messagePayload: any) {
    // Mocking the configuration
    const config = {
      provider: 'azure',
      enabled: true,
      queueName: 'segmanta_queue_1',
      connectionString: 'Endpoint=sb://...',
      batchSize: 5,
      maxWaitTimeMs: 30000,
      messageValidation: {
        enabled: true,
        schema: {
          region: 'string',
          item_gtin: 'string',
          loyalty_codes: 'array_of_strings',
        },
      },
      sendingOptions: {
        priorityEnabled: true,
        timeToLiveMs: 600000,
        delayMs: 2000,
      },
    };

    // Validate the message structure
    if (config.messageValidation.enabled) {
      MessageValidator.validate(
        config.messageValidation.schema,
        messagePayload,
      );
    }
    const queueService = this.queueConfigService.getQueueProvider();
    await queueService.sendMessage('test-queue2', messagePayload, {
      priority: config.sendingOptions.priorityEnabled,
    });
    return 'Message sent!';
  }
}
