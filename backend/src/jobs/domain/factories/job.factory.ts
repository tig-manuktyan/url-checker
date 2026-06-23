import { randomUUID } from 'node:crypto';
import { JobStatus } from '@url-checker/shared/enums';
import { JobEntity } from '@url-checker/jobs/domain/entities/job.entity';
import { createPendingUrlCheck } from '@url-checker/jobs/domain/entities/url-check.entity';

export const createJobEntity = (urls: string[]): JobEntity => {
  const now = new Date();

  return {
    id: randomUUID(),
    status: JobStatus.Pending,
    createdAt: now,
    updatedAt: now,
    cancelled: false,
    urls: urls.map(createPendingUrlCheck),
  };
};
