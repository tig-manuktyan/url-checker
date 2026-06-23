import { formatDate } from '@url-checker/utils/format';
import type { JobSummaryOutputDto } from '@url-checker/types/job.types';
import { StatusBadge } from '@url-checker/components/ui';

export interface JobListItemProps {
  job: JobSummaryOutputDto;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const JobListItem = ({
  job,
  isActive,
  onClick,
}: JobListItemProps): JSX.Element => (
  <button
    type="button"
    className={`job-list__item${isActive ? ' job-list__item--active' : ''}`}
    onClick={() => onClick(job.id)}
  >
    <div className="job-list__row">
      <span className="job-list__id">{job.id.slice(0, 8)}</span>
      <StatusBadge status={job.status} variant="job" />
    </div>
    <div className="job-list__meta">
      <span>{formatDate(job.createdAt)}</span>
      <span>
        {job.successCount} ок · {job.errorCount} err · {job.totalUrls} всего
      </span>
    </div>
  </button>
);
