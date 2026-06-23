export const JobStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
  Failed: 'failed',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const UrlStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Success: 'success',
  Error: 'error',
  Cancelled: 'cancelled',
} as const;

export type UrlStatus = (typeof UrlStatus)[keyof typeof UrlStatus];

export interface UrlResult {
  url: string;
  status: UrlStatus;
  httpStatus: number | null;
  errorMessage: string | null;
  durationMs: number | null;
}

export interface JobSummaryOutputDto {
  id: string;
  status: JobStatus;
  createdAt: string;
  totalUrls: number;
  successCount: number;
  errorCount: number;
}

export interface JobDetailOutputDto extends JobSummaryOutputDto {
  progress: { processed: number; total: number };
  urls: UrlResult[];
}

export interface CreateJobResponseDto {
  id: string;
}

export const TERMINAL_JOB_STATUSES: readonly JobStatus[] = [
  JobStatus.Completed,
  JobStatus.Cancelled,
  JobStatus.Failed,
];

export const POLL_INTERVAL_MS = 1_500;
