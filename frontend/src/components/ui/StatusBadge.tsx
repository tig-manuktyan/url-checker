import type { JobStatus, UrlStatus } from '@url-checker/types/job.types';

const JOB_LABELS: Record<JobStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'В процессе',
  completed: 'Завершено',
  cancelled: 'Отменено',
  failed: 'Ошибка',
};

const URL_LABELS: Record<UrlStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'Проверяется',
  success: 'Успех',
  error: 'Ошибка',
  cancelled: 'Отменено',
};

export interface StatusBadgeProps {
  status: JobStatus | UrlStatus;
  variant: 'job' | 'url';
}

export const StatusBadge = ({ status, variant }: StatusBadgeProps): JSX.Element => {
  const label =
    variant === 'job'
      ? JOB_LABELS[status as JobStatus]
      : URL_LABELS[status as UrlStatus];

  return <span className={`badge badge--${status}`}>{label}</span>;
};
