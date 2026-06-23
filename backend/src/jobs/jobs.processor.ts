import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import {
  JOB_POLL_TIMEOUT_MS,
  JOB_SEMAPHORE_LIMIT,
} from '@url-checker/shared/constants/job.constants';
import { JobStatus, UrlStatus } from '@url-checker/shared/enums';
import { Semaphore } from '@url-checker/shared/utils/semaphore';
import { JobEntity, UrlCheckEntity } from '@url-checker/jobs/domain';
import { JobsRepository } from '@url-checker/jobs/jobs.repository';

@Injectable()
export class JobProcessorService {
  private readonly logger = new Logger(JobProcessorService.name);
  private readonly activeJobs = new Set<string>();

  constructor(private readonly repository: JobsRepository) {}

  start(jobId: string): void {
    if (this.activeJobs.has(jobId)) {
      return;
    }

    this.activeJobs.add(jobId);
    void this.process(jobId).finally(() => {
      this.activeJobs.delete(jobId);
    });
  }

  private async process(jobId: string): Promise<void> {
    const job = this.repository.findById(jobId);
    if (!job) {
      return;
    }

    if (job.cancelled) {
      this.markPendingAsCancelled(job);
      job.status = JobStatus.Cancelled;
      this.repository.save(job);
      return;
    }

    job.status = JobStatus.InProgress;
    this.repository.save(job);

    const semaphore = new Semaphore(JOB_SEMAPHORE_LIMIT);

    try {
      await Promise.all(
        job.urls.map((item) => this.processUrl(job, item, semaphore)),
      );
      job.status = job.cancelled ? JobStatus.Cancelled : JobStatus.Completed;
      this.repository.save(job);
    } catch (error) {
      this.logger.error(`Job ${jobId} failed`, error);
      job.status = JobStatus.Failed;
      this.repository.save(job);
    }
  }

  private async processUrl(
    job: JobEntity,
    item: UrlCheckEntity,
    semaphore: Semaphore,
  ): Promise<void> {
    if (job.cancelled) {
      if (item.status === UrlStatus.Pending) {
        item.status = UrlStatus.Cancelled;
        this.repository.save(job);
      }
      return;
    }

    await semaphore.acquire();

    try {
      if (job.cancelled && item.status === UrlStatus.Pending) {
        item.status = UrlStatus.Cancelled;
        this.repository.save(job);
        return;
      }

      if (item.status !== UrlStatus.Pending) {
        return;
      }

      item.status = UrlStatus.InProgress;
      this.repository.save(job);

      const startedAt = Date.now();
      const result = await this.headRequest(item.url);
      const durationMs = Date.now() - startedAt;

      item.durationMs = durationMs;

      if ('httpStatus' in result) {
        item.status = UrlStatus.Success;
        item.httpStatus = result.httpStatus;
        item.errorMessage = null;
      } else {
        item.status = UrlStatus.Error;
        item.httpStatus = null;
        item.errorMessage = result.errorMessage;
      }

      this.repository.save(job);
    } finally {
      semaphore.release();
    }
  }

  private async headRequest(
    url: string,
  ): Promise<{ httpStatus: number } | { errorMessage: string }> {
    try {
      const response = await axios.head(url, {
        timeout: JOB_POLL_TIMEOUT_MS,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      return { httpStatus: response.status };
    } catch (error) {
      if (error instanceof AxiosError) {
        return { errorMessage: error.message };
      }

      return {
        errorMessage:
          error instanceof Error ? error.message : 'Unknown request error',
      };
    }
  }

  private markPendingAsCancelled(job: JobEntity): void {
    for (const item of job.urls) {
      if (item.status === UrlStatus.Pending) {
        item.status = UrlStatus.Cancelled;
      }
    }
  }
}
