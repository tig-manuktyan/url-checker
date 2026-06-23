import { UrlStatus } from '@url-checker/shared/enums';

export interface UrlCheckEntity {
  url: string;
  status: UrlStatus;
  httpStatus: number | null;
  errorMessage: string | null;
  durationMs: number | null;
}

export const createPendingUrlCheck = (url: string): UrlCheckEntity => ({
  url,
  status: UrlStatus.Pending,
  httpStatus: null,
  errorMessage: null,
  durationMs: null,
});
