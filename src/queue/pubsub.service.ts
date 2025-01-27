import { Injectable } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';

@Injectable()
export class PubSubService {
  private pubSubClient = new PubSub();

  async sendMessage(topicName: string, message: string) {
    const topic = this.pubSubClient.topic(topicName);
    await topic.publish(Buffer.from(message));
  }
}
