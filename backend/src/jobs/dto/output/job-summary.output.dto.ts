import { JobStatus } from '@url-checker/shared/enums';

export interface JobSummaryOutputDto {
  id: string;
  status: JobStatus;
  createdAt: string;
  totalUrls: number;
  successCount: number;
  errorCount: number;
}
