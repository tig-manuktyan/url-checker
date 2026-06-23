import {
  isTerminalUrlStatus,
} from '@url-checker/shared/constants/job.constants';
import { UrlStatus } from '@url-checker/shared/enums';
import { JobDetailOutputDto } from '@url-checker/jobs/dto/output/job-detail.output.dto';
import { JobSummaryOutputDto } from '@url-checker/jobs/dto/output/job-summary.output.dto';
import { UrlResultOutputDto } from '@url-checker/jobs/dto/output/url-result.output.dto';
import { JobEntity, UrlCheckEntity } from '@url-checker/jobs/domain';

const countByStatus = (urls: UrlCheckEntity[], status: UrlStatus): number =>
  urls.filter((item) => item.status === status).length;

const toUrlResultDto = (item: UrlCheckEntity): UrlResultOutputDto => ({
  url: item.url,
  status: item.status,
  httpStatus: item.httpStatus,
  errorMessage: item.errorMessage,
  durationMs: item.durationMs,
});

export const toSummaryDto = (job: JobEntity): JobSummaryOutputDto => ({
  id: job.id,
  status: job.status,
  createdAt: job.createdAt.toISOString(),
  totalUrls: job.urls.length,
  successCount: countByStatus(job.urls, UrlStatus.Success),
  errorCount: countByStatus(job.urls, UrlStatus.Error),
});

export const toDetailDto = (job: JobEntity): JobDetailOutputDto => {
  const processed = job.urls.filter((item) =>
    isTerminalUrlStatus(item.status),
  ).length;

  return {
    ...toSummaryDto(job),
    progress: { processed, total: job.urls.length },
    urls: job.urls.map(toUrlResultDto),
  };
};
