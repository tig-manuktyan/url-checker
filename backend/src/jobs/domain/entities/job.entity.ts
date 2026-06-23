import { JobStatus } from '@url-checker/shared/enums';
import { UrlCheckEntity } from '@url-checker/jobs/domain/entities/url-check.entity';

export interface JobEntity {
  id: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  cancelled: boolean;
  urls: UrlCheckEntity[];
}
