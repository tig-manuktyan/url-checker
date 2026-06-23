import { useEffect } from 'react';
import { CreateJobForm } from '@url-checker/components/CreateJobForm';
import { JobDetailPanel } from '@url-checker/components/JobDetailPanel';
import { JobList } from '@url-checker/components/JobList';
import { useJobStore } from '@url-checker/store/job.store';
import '@url-checker/styles/global.css';

export const App = (): JSX.Element => {
  const fetchJobs = useJobStore((state) => state.fetchJobs);
  const error = useJobStore((state) => state.error);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__eyebrow">Async URL Checker</p>
        <h1>Проверка списка URL</h1>
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <main className="app__layout">
        <aside className="app__sidebar">
          <CreateJobForm />
          <JobList />
        </aside>
        <JobDetailPanel />
      </main>
    </div>
  );
};
