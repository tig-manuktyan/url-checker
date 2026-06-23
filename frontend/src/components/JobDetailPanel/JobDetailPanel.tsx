import { formatDate } from '@url-checker/utils/format';
import { StatusBadge } from '@url-checker/components/ui';
import { useJobStore } from '@url-checker/store/job.store';
import {
  TERMINAL_JOB_STATUSES,
  type JobDetailOutputDto,
} from '@url-checker/types/job.types';
import { ProgressCard } from './ProgressCard';
import { UrlTable } from './UrlTable';

const DetailContent = ({ detail }: { detail: JobDetailOutputDto }): JSX.Element => {
  const isCancelling = useJobStore((state) => state.isCancelling);
  const cancelActiveJob = useJobStore((state) => state.cancelActiveJob);
  const canCancel = !TERMINAL_JOB_STATUSES.includes(detail.status);

  return (
    <>
      <header className="panel__header panel__header--detail">
        <div>
          <h2>Задание {detail.id.slice(0, 8)}</h2>
          <p>Создано {formatDate(detail.createdAt)}</p>
        </div>
        <StatusBadge status={detail.status} variant="job" />
      </header>

      <ProgressCard progress={detail.progress} />

      {canCancel && (
        <button
          className="button button--danger"
          type="button"
          onClick={() => {
            void cancelActiveJob();
          }}
          disabled={isCancelling}
        >
          {isCancelling ? 'Отмена...' : 'Отменить задание'}
        </button>
      )}

      <UrlTable urls={detail.urls} />
    </>
  );
};

export const JobDetailPanel = (): JSX.Element => {
  const activeJobId = useJobStore((state) => state.activeJobId);
  const detail = useJobStore((state) => state.activeJobDetail);
  const isLoadingDetail = useJobStore((state) => state.isLoadingDetail);

  if (!activeJobId) {
    return (
      <section className="panel panel--detail panel--empty">
        <p className="muted">Выберите задание или создайте новое</p>
      </section>
    );
  }

  if (!detail && isLoadingDetail) {
    return (
      <section className="panel panel--detail">
        <p className="muted">Загрузка деталей...</p>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="panel panel--detail">
        <p className="muted">Не удалось загрузить задание</p>
      </section>
    );
  }

  return (
    <section className="panel panel--detail">
      <DetailContent detail={detail} />
    </section>
  );
};
