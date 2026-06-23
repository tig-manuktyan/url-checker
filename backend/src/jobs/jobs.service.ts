import assert from 'node:assert';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TERMINAL_JOB_STATUSES } from '@url-checker/shared/constants/job.constants';
import { JobStatus, UrlStatus } from '@url-checker/shared/enums';
import { CreateJobInputDto } from '@url-checker/jobs/dto/input/create-job.input.dto';
import { JobDetailOutputDto } from '@url-checker/jobs/dto/output/job-detail.output.dto';
import { JobSummaryOutputDto } from '@url-checker/jobs/dto/output/job-summary.output.dto';
import { createJobEntity } from '@url-checker/jobs/domain';
import { toDetailDto, toSummaryDto } from '@url-checker/jobs/jobs.mapper';
import { JobProcessorService } from '@url-checker/jobs/jobs.processor';
import { JobsRepository } from '@url-checker/jobs/jobs.repository';

@Injectable()
export class JobsService {
  constructor(
    private readonly repository: JobsRepository,
    private readonly processor: JobProcessorService,
  ) {}

  create(dto: CreateJobInputDto): { id: string } {
    const job = createJobEntity(dto.urls);
    this.repository.create(job);
    this.processor.start(job.id);
    return { id: job.id };
  }

  findAll(): JobSummaryOutputDto[] {
    return this.repository.findAll().map(toSummaryDto);
  }

  findOne(id: string): JobDetailOutputDto {
    const job = this.repository.findById(id);
    assert(job, new NotFoundException(`Job ${id} not found`));
    return toDetailDto(job);
  }

  cancel(id: string): void {
    const job = this.repository.findById(id);
    assert(job, new NotFoundException(`Job ${id} not found`));
    assert(
      !TERMINAL_JOB_STATUSES.includes(job.status),
      new ConflictException('Job already terminal'),
    );

    job.cancelled = true;

    for (const item of job.urls) {
      if (item.status === UrlStatus.Pending) {
        item.status = UrlStatus.Cancelled;
      }
    }

    const hasInProgress = job.urls.some(
      (item) => item.status === UrlStatus.InProgress,
    );

    if (!hasInProgress) {
      job.status = JobStatus.Cancelled;
    }

    this.repository.save(job);
  }
}
