import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Job } from 'bull';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<Job> {
    return this.appService.addTranscodeJob();
  }
}
