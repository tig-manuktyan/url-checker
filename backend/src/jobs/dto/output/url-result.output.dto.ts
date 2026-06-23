import { UrlStatus } from '@url-checker/shared/enums';

export interface UrlResultOutputDto {
  url: string;
  status: UrlStatus;
  httpStatus: number | null;
  errorMessage: string | null;
  durationMs: number | null;
}
