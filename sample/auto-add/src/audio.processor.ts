import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueuesEnum } from './queues.enum';

@Processor(QueuesEnum.Audio)
export class AudioProcessor {
  private readonly logger = new Logger(AudioProcessor.name);

  @Process()
  async transcode(job: Job<string>) {
    this.logger.debug('transcoding audio:', job.data);
  }
}
