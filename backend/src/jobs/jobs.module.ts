import { Module } from '@nestjs/common';
import { JobProcessorService } from '@url-checker/jobs/jobs.processor';
import { JobsController } from '@url-checker/jobs/jobs.controller';
import { JobsRepository } from '@url-checker/jobs/jobs.repository';
import { JobsService } from '@url-checker/jobs/jobs.service';

@Module({
  controllers: [JobsController],
  providers: [JobsRepository, JobsService, JobProcessorService],
})
export class JobsModule {}
