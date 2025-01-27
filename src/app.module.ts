import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
