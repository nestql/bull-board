import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { QueuesEnum } from './queues.enum';
import { BullBoardModule } from '@nestql/bull-board';
import { AudioProcessor } from './audio.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: QueuesEnum.Audio }),
    BullBoardModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService, AudioProcessor],
})
export class AppModule {}
