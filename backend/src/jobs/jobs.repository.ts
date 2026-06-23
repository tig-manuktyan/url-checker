import { Injectable } from '@nestjs/common';
import { JobEntity } from '@url-checker/jobs/domain';

@Injectable()
export class JobsRepository {
  private readonly jobs = new Map<string, JobEntity>();

  create(job: JobEntity): JobEntity {
    this.jobs.set(job.id, job);
    return job;
  }

  findById(id: string): JobEntity | undefined {
    return this.jobs.get(id);
  }

  findAll(): JobEntity[] {
    return Array.from(this.jobs.values()).sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  save(job: JobEntity): void {
    job.updatedAt = new Date();
    this.jobs.set(job.id, job);
  }
}
