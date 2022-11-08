import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { QueuesEnum } from './queues.enum';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectQueue(QueuesEnum.Audio) private audioQueue: Queue<{ file: string }>,
  ) {}

  async addTranscodeJob(): Promise<Job> {
    const job = await this.audioQueue.add({ file: 'audio.mp3' });
    this.logger.debug('job has been created');
    return job;
  }
}
