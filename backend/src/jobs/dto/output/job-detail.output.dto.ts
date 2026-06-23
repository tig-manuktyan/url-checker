import { JobSummaryOutputDto } from '@url-checker/jobs/dto/output/job-summary.output.dto';
import { UrlResultOutputDto } from '@url-checker/jobs/dto/output/url-result.output.dto';

export interface JobDetailOutputDto extends JobSummaryOutputDto {
  progress: {
    processed: number;
    total: number;
  };
  urls: UrlResultOutputDto[];
}
