import { JobStatus, UrlStatus } from '@url-checker/shared/enums';

export const JOB_SEMAPHORE_LIMIT = 5;
export const JOB_POLL_TIMEOUT_MS = 10_000;

export const TERMINAL_JOB_STATUSES: readonly JobStatus[] = [
  JobStatus.Completed,
  JobStatus.Cancelled,
  JobStatus.Failed,
];

export const TERMINAL_URL_STATUSES: readonly UrlStatus[] = [
  UrlStatus.Success,
  UrlStatus.Error,
  UrlStatus.Cancelled,
];

export const isTerminalJobStatus = (status: JobStatus): boolean =>
  TERMINAL_JOB_STATUSES.includes(status);

export const isTerminalUrlStatus = (status: UrlStatus): boolean =>
  TERMINAL_URL_STATUSES.includes(status);
