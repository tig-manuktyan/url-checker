import { useJobStore } from '@url-checker/store/job.store';
import { JobListItem } from './JobListItem';

export const JobList = (): JSX.Element => {
  const jobs = useJobStore((state) => state.jobs);
  const activeJobId = useJobStore((state) => state.activeJobId);
  const isLoadingList = useJobStore((state) => state.isLoadingList);
  const selectJob = useJobStore((state) => state.selectJob);

  return (
    <section className="panel">
      <header className="panel__header">
        <h2>Задания</h2>
        <p>Последние проверки</p>
      </header>

      {isLoadingList && jobs.length === 0 ? (
        <p className="muted">Загрузка...</p>
      ) : jobs.length === 0 ? (
        <p className="muted">Заданий пока нет</p>
      ) : (
        <ul className="job-list">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobListItem
                job={job}
                isActive={activeJobId === job.id}
                onClick={(id) => {
                  void selectJob(id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
